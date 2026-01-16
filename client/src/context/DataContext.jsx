import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { fetchSchedules, fetchResults, fetchTeamLogos } from '../services/api';

const DataContext = createContext();

export function DataProvider({ children }) {
    const [schedule, setSchedule] = useState([]);
    const [results, setResults] = useState([]);
    const [teams, setTeams] = useState([]);
    const [teamLogos, setTeamLogos] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                const [scheduleData, resultsData, logosData] = await Promise.all([
                    fetchSchedules().catch(() => null),
                    fetchResults().catch(() => []),
                    fetchTeamLogos().catch(() => [])
                ]);

                if (scheduleData) {
                    const scheduleList = scheduleData.schedule || scheduleData || [];
                    setSchedule(scheduleList);

                    // ใช้ teams จาก API โดยตรง (ถ้ามี) หรือดึงจาก matches
                    let teamsList = [];
                    if (scheduleData.teams && Array.isArray(scheduleData.teams)) {
                        // ดึงจาก scheduleData.teams โดยตรง
                        teamsList = scheduleData.teams;
                    } else {
                        // Fallback: ดึงจาก matches ใน schedule
                        const allTeams = new Set();
                        scheduleList.forEach(round => {
                            (round.matches || []).forEach(match => {
                                if (match.blue) allTeams.add(match.blue);
                                if (match.red) allTeams.add(match.red);
                            });
                        });
                        teamsList = [...allTeams];
                    }

                    console.log('📊 Loaded teams:', teamsList);
                    setTeams(teamsList);
                } else {
                    // ถ้าไม่มี schedule → ไม่มีทีม (Standings ว่างเปล่า)
                    setSchedule([]);
                    setTeams([]);
                }

                setResults(resultsData || []);

                // Convert logos array to object for quick lookup
                const logosObj = {};
                (logosData || []).forEach(item => {
                    logosObj[item.teamName] = item.logoUrl;
                });
                setTeamLogos(logosObj);

            } catch (err) {
                setError(err.message);
                console.error('Data loading error:', err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    // Calculate standings from results (memoized)
    const standings = useMemo(() => {
        console.log('📊 Computing standings from teams:', teams.length, 'results:', results.length);

        const computed = teams.map(teamName => {
            let p = 0, w = 0, l = 0, gd = 0, pts = 0;

            results.forEach(r => {
                // Exclude Knockout Stages (>= 90) from Standings
                if (r.matchDay && parseInt(r.matchDay) >= 90) return;

                // Handle bye wins separately (ชนะบาย = 3 pts, 1 win, ไม่คิด GD)
                if (r.isByeWin) {
                    if (r.winner === teamName) {
                        p++; // Played
                        w++; // Win
                        pts += 3; // 3 points
                        // No GD calculation for bye wins
                    } else if (r.loser === teamName) {
                        p++; // Played
                        l++; // Loss
                        // No GD calculation for bye wins
                    }
                    return;
                }

                // Normal match
                if (r.teamBlue === teamName) {
                    p++;
                    if (r.scoreBlue > r.scoreRed) { w++; pts += 3; } else { l++; }
                    gd += (r.scoreBlue - r.scoreRed);
                } else if (r.teamRed === teamName) {
                    p++;
                    if (r.scoreRed > r.scoreBlue) { w++; pts += 3; } else { l++; }
                    gd += (r.scoreRed - r.scoreBlue);
                }
            });

            return { name: teamName, p, w, l, gd, pts };
        }).sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.gd !== a.gd) return b.gd - a.gd;
            return a.name.localeCompare(b.name);
        });

        console.log('📊 Standings computed:', computed);
        return computed;
    }, [teams, results]);

    const getTeamLogo = (teamName) => teamLogos[teamName] || null;

    const value = {
        schedule,
        results,
        teams,
        teamLogos,
        standings,
        loading,
        error,
        getTeamLogo,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
