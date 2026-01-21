import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { fetchSchedules, fetchResults, fetchTeamLogos } from '../services/api';

// Types
interface ScheduleMatch {
    blue: string;
    red: string;
    date?: string;
}

interface ScheduleRound {
    day: number;
    date?: string;
    matches: ScheduleMatch[];
}

interface MatchResult {
    matchId: string;
    matchDay: number | string;
    teamBlue: string;
    teamRed: string;
    scoreBlue: number;
    scoreRed: number;
    winner: string;
    loser: string;
    isByeWin?: boolean;
    mvp?: string;
    gameDetails?: any[];
}

interface TeamStanding {
    name: string;
    p: number;
    w: number;
    l: number;
    gd: number;
    pts: number;
}

interface DataContextType {
    schedule: ScheduleRound[];
    results: MatchResult[];
    teams: string[];
    teamLogos: Record<string, string>;
    standings: TeamStanding[];
    loading: boolean;
    error: string | null;
    getTeamLogo: (teamName: string) => string | null;
    refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
    children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
    const [schedule, setSchedule] = useState<ScheduleRound[]>([]);
    const [results, setResults] = useState<MatchResult[]>([]);
    const [teams, setTeams] = useState<string[]>([]);
    const [teamLogos, setTeamLogos] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Function to trigger data refresh
    const refreshData = () => {
        setRefreshKey(prev => prev + 1);
    };

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
                    let teamsList: string[] = [];
                    if (scheduleData.teams && Array.isArray(scheduleData.teams)) {
                        // ดึงจาก scheduleData.teams โดยตรง
                        teamsList = scheduleData.teams;
                    } else {
                        // Fallback: ดึงจาก matches ใน schedule
                        const allTeams = new Set<string>();
                        scheduleList.forEach((round: ScheduleRound) => {
                            (round.matches || []).forEach((match: ScheduleMatch) => {
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
                const logosObj: Record<string, string> = {};
                (logosData || []).forEach((item: { teamName: string; logoUrl: string }) => {
                    logosObj[item.teamName] = item.logoUrl;
                });
                setTeamLogos(logosObj);

            } catch (err: any) {
                setError(err.message);
                console.error('Data loading error:', err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [refreshKey]); // Trigger reload when refreshKey changes

    // Calculate standings from results (memoized)
    const standings = useMemo(() => {
        console.log('📊 Computing standings from teams:', teams.length, 'results:', results.length);

        const computed = teams.map(teamName => {
            let p = 0, w = 0, l = 0, gd = 0, pts = 0;

            results.forEach(r => {
                // Exclude Knockout Stages (>= 90) from Standings
                if (r.matchDay && parseInt(String(r.matchDay)) >= 90) return;

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

    const getTeamLogo = (teamName: string): string | null => teamLogos[teamName] || null;

    const value: DataContextType = {
        schedule,
        results,
        teams,
        teamLogos,
        standings,
        loading,
        error,
        getTeamLogo,
        refreshData,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData(): DataContextType {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
