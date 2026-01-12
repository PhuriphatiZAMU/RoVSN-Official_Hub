import { createContext, useContext, useState, useEffect } from 'react';
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

                    // ดึงรายชื่อทีมจาก matches ใน schedule
                    const allTeams = new Set();
                    scheduleList.forEach(round => {
                        (round.matches || []).forEach(match => {
                            if (match.blue) allTeams.add(match.blue);
                            if (match.red) allTeams.add(match.red);
                        });
                    });

                    // ใช้ทีมจาก schedule เท่านั้น (ไม่มี default)
                    setTeams([...allTeams]);
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

    // Calculate standings from results
    const standings = teams.map(teamName => {
        let p = 0, w = 0, l = 0, gd = 0, pts = 0;

        results.forEach(r => {
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
