import {
    Team,
    Player,
    MatchResult,
    Standing,
    ScheduleItem,
    PlayerStat,
    TeamStat,
    SeasonStats,
    Hero,
    PlayerHeroStat
} from '@/types';

// Server-side API URL (private, for SSR and Server Components)
const getServerApiUrl = () => {
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

// Type for fetch options
type FetchOptions = RequestInit & {
    token?: string;
};

// Generic fetch wrapper for server-side calls
async function serverFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = `${getServerApiUrl()}${endpoint}`;
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers,
        // Next.js caching options
        next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// Types for processed home page data
export interface ScheduleMatch {
    blue: string;
    red: string;
    date?: string;
}

export interface ScheduleRound {
    day: number;
    date?: string;
    matches: ScheduleMatch[];
}

export interface ProcessedStanding {
    name: string;
    p: number;
    w: number;
    l: number;
    gd: number;
    pts: number;
}

export interface MatchWithResult {
    match: ScheduleMatch;
    result: MatchResult;
    day: number;
    index: number;
    date?: string;
}

// Helper to map API schedule data (teamA/teamB) to UI structure (blue/red)
function mapSchedule(scheduleData: ScheduleItem | null): ScheduleRound[] {
    if (!scheduleData?.schedule) return [];

    return scheduleData.schedule.map((round: any) => ({
        day: round.day,
        date: round.date,
        matches: (round.matches || []).map((match: any) => ({
            blue: match.teamA || match.blue || 'Unknown',
            red: match.teamB || match.red || 'Unknown',
            date: match.date
        }))
    }));
}

// Server-side API service (for Server Components)
export const serverApi = {
    // --- Teams & Clubs ---
    getTeams: async (): Promise<Team[]> => {
        const data = await serverFetch<{ teamName: string; logoUrl: string }[]>('/team-logos');
        return data.map(item => ({
            _id: item.teamName,
            name: item.teamName,
            logo: item.logoUrl,
            logoShort: item.logoUrl
        }));
    },

    getTeamLogos: async (): Promise<Record<string, string>> => {
        const data = await serverFetch<{ teamName: string; logoUrl: string }[]>('/team-logos');
        const logosObj: Record<string, string> = {};
        data.forEach(item => {
            if (item.teamName) logosObj[item.teamName] = item.logoUrl;
        });
        return logosObj;
    },

    getTeamStats: async (): Promise<TeamStat[]> => {
        return serverFetch<TeamStat[]>('/team-stats');
    },

    // --- Players ---
    getPlayers: async (): Promise<Player[]> => {
        return serverFetch<Player[]>('/players');
    },

    getPlayerStats: async (): Promise<PlayerStat[]> => {
        return serverFetch<PlayerStat[]>('/player-stats');
    },

    getPlayerHeroStats: async (): Promise<PlayerHeroStat[]> => {
        return serverFetch<PlayerHeroStat[]>('/player-hero-stats');
    },

    // --- Matches & Results ---
    getResults: async (): Promise<MatchResult[]> => {
        return serverFetch<MatchResult[]>('/results');
    },

    // --- Schedule ---
    getSchedule: async (): Promise<ScheduleItem> => {
        return serverFetch<ScheduleItem>('/schedules');
    },

    getScheduleRounds: async (): Promise<ScheduleRound[]> => {
        try {
            const scheduleData = await serverFetch<ScheduleItem>('/schedules');
            return mapSchedule(scheduleData);
        } catch {
            return [];
        }
    },

    // --- Standings ---
    getStandings: async (): Promise<Standing[]> => {
        return serverFetch<Standing[]>('/standings');
    },

    // Processed standings for display
    getProcessedStandings: async (): Promise<ProcessedStanding[]> => {
        try {
            const standings = await serverFetch<any[]>('/standings');
            return standings.map(s => ({
                name: s.team || s.name,
                p: s.played || s.p || 0,
                w: s.won || s.w || 0,
                l: s.lost || s.l || 0,
                gd: s.gameDiff || s.gd || 0,
                pts: s.points || s.pts || ((s.won || s.w || 0) * 3),
            }));
        } catch {
            return [];
        }
    },

    // --- Stats ---
    getSeasonStats: async (): Promise<SeasonStats> => {
        return serverFetch<SeasonStats>('/season-stats');
    },

    getHeroes: async (): Promise<Hero[]> => {
        return serverFetch<Hero[]>('/heroes');
    },

    // --- Combined Data Fetching (for Pages) ---

    // Home Page Data
    getHomePageData: async () => {
        try {
            const [scheduleData, resultsData, logosData, standingsData] = await Promise.all([
                serverFetch<ScheduleItem>('/schedules').catch(() => null),
                serverFetch<MatchResult[]>('/results').catch(() => []),
                serverFetch<{ teamName: string; logoUrl: string }[]>('/team-logos').catch(() => []),
                serverFetch<any[]>('/standings').catch(() => []),
            ]);

            // Process schedule using mapping helper
            const schedule: ScheduleRound[] = mapSchedule(scheduleData);

            // Process logos
            const teamLogos: Record<string, string> = {};
            (logosData || []).forEach(item => {
                if (item.teamName) teamLogos[item.teamName] = item.logoUrl;
            });

            // Process standings
            const standings: ProcessedStanding[] = (standingsData || []).map(s => ({
                name: s.team || s.name,
                p: s.played || s.p || 0,
                w: s.won || s.w || 0,
                l: s.lost || s.l || 0,
                gd: s.gameDiff || s.gd || 0,
                pts: s.points || s.pts || ((s.won || s.w || 0) * 3), // 3 pts per win
            }));

            // Get latest matches with results
            const matchesWithResults: MatchWithResult[] = [];
            schedule.forEach(round => {
                (round.matches || []).forEach((m, index) => {
                    const matchKey = `${round.day}_${m.blue}_vs_${m.red}`.replace(/\s+/g, '');
                    const result = (resultsData || []).find(r => r.matchId === matchKey);
                    if (result) {
                        matchesWithResults.push({
                            match: m,
                            result,
                            day: round.day,
                            index,
                            date: m.date || round.date
                        });
                    }
                });
            });

            // Sort by day and index descending (most recent first)
            const latestMatches = matchesWithResults
                .sort((a, b) => {
                    if (b.day !== a.day) return b.day - a.day;
                    return b.index - a.index;
                })
                .slice(0, 4);

            // If no results yet, get first scheduled matches
            let upcomingMatches: ScheduleMatch[] = [];
            if (latestMatches.length === 0 && schedule.length > 0) {
                const dayData = schedule.find(r => r.day === 1);
                if (dayData) {
                    upcomingMatches = dayData.matches.slice(0, 4);
                }
            }

            return {
                schedule,
                standings,
                teamLogos,
                latestMatches,
                upcomingMatches,
                results: resultsData || [],
            };
        } catch (error) {
            console.error('Error fetching home page data:', error);
            return {
                schedule: [],
                standings: [],
                teamLogos: {},
                latestMatches: [],
                upcomingMatches: [],
                results: [],
            };
        }
    },

    // Standings Page Data
    getStandingsPageData: async () => {
        try {
            const [standingsData, logosData] = await Promise.all([
                serverFetch<any[]>('/standings').catch(() => []),
                serverFetch<{ teamName: string; logoUrl: string }[]>('/team-logos').catch(() => []),
            ]);

            const teamLogos: Record<string, string> = {};
            (logosData || []).forEach(item => {
                if (item.teamName) teamLogos[item.teamName] = item.logoUrl;
            });

            const standings: ProcessedStanding[] = (standingsData || []).map(s => ({
                name: s.team || s.name,
                p: s.played || s.p || 0,
                w: s.won || s.w || 0,
                l: s.lost || s.l || 0,
                gd: s.gameDiff || s.gd || 0,
                pts: s.points || s.pts || ((s.won || s.w || 0) * 3), // 3 pts per win
            }));

            return { standings, teamLogos };
        } catch (error) {
            console.error('Error fetching standings data:', error);
            return { standings: [], teamLogos: {} };
        }
    },

    // Fixtures Page Data
    getFixturesPageData: async () => {
        try {
            const [scheduleData, resultsData, logosData] = await Promise.all([
                serverFetch<ScheduleItem>('/schedules').catch(() => null),
                serverFetch<MatchResult[]>('/results').catch(() => []),
                serverFetch<{ teamName: string; logoUrl: string }[]>('/team-logos').catch(() => []),
            ]);

            // Map schedule
            const schedule: ScheduleRound[] = mapSchedule(scheduleData);
            const results = resultsData || [];

            const teamLogos: Record<string, string> = {};
            (logosData || []).forEach(item => {
                if (item.teamName) teamLogos[item.teamName] = item.logoUrl;
            });

            // Sort schedule by day
            const sortedSchedule = [...schedule].sort((a, b) => a.day - b.day);

            return { schedule: sortedSchedule, results, teamLogos };
        } catch (error) {
            console.error('Error fetching fixtures data:', error);
            return { schedule: [], results: [], teamLogos: {} };
        }
    },

    // Clubs Page Data
    getClubsPageData: async () => {
        try {
            const logosData = await serverFetch<{ teamName: string; logoUrl: string }[]>('/team-logos').catch(() => []);

            const teams = (logosData || []).map(item => item.teamName).filter(Boolean);

            const teamLogos: Record<string, string> = {};
            (logosData || []).forEach(item => {
                if (item.teamName) teamLogos[item.teamName] = item.logoUrl;
            });

            return { teams, teamLogos };
        } catch (error) {
            console.error('Error fetching clubs data:', error);
            return { teams: [], teamLogos: {} };
        }
    },

    // Stats Page Data (Season Overview)
    getSeasonStatsPageData: async () => {
        try {
            const [seasonStats, heroes, logosData] = await Promise.all([
                serverFetch<SeasonStats>('/season-stats').catch(() => null),
                serverFetch<Hero[]>('/heroes').catch(() => []),
                serverFetch<{ teamName: string; logoUrl: string }[]>('/team-logos').catch(() => []),
            ]);

            const teamLogos: Record<string, string> = {};
            (logosData || []).forEach(item => {
                if (item.teamName) teamLogos[item.teamName] = item.logoUrl;
            });

            return {
                seasonStats: seasonStats || null,
                heroes: heroes || [],
                teamLogos
            };
        } catch (error) {
            console.error('Error fetching season stats:', error);
            return { seasonStats: null, heroes: [], teamLogos: {} };
        }
    },

    // Team Stats Page Data
    getTeamStatsPageData: async () => {
        try {
            const [teamStats, logosData] = await Promise.all([
                serverFetch<TeamStat[]>('/team-stats').catch(() => []),
                serverFetch<{ teamName: string; logoUrl: string }[]>('/team-logos').catch(() => []),
            ]);

            const teamLogos: Record<string, string> = {};
            (logosData || []).forEach(item => {
                if (item.teamName) teamLogos[item.teamName] = item.logoUrl;
            });

            // Sort by Win Rate -> Wins -> KDA -> Kills
            const sortedStats = (teamStats || []).sort((a, b) => {
                const winRateA = a.realGamesPlayed > 0 ? (a.realWins / a.realGamesPlayed) : 0;
                const winRateB = b.realGamesPlayed > 0 ? (b.realWins / b.realGamesPlayed) : 0;
                if (winRateB !== winRateA) return winRateB - winRateA;
                if (b.realWins !== a.realWins) return b.realWins - a.realWins;
                if ((b.kda || 0) !== (a.kda || 0)) return (b.kda || 0) - (a.kda || 0);
                return (b.totalKills || 0) - (a.totalKills || 0);
            });

            return { teamStats: sortedStats, teamLogos };
        } catch (error) {
            console.error('Error fetching team stats:', error);
            return { teamStats: [], teamLogos: {} };
        }
    },

    // Player Stats Page Data
    getPlayerStatsPageData: async () => {
        try {
            const [playerStats, playerHeroStats, heroes, logosData] = await Promise.all([
                serverFetch<PlayerStat[]>('/player-stats').catch(() => []),
                serverFetch<PlayerHeroStat[]>('/player-hero-stats').catch(() => []),
                serverFetch<Hero[]>('/heroes').catch(() => []),
                serverFetch<{ teamName: string; logoUrl: string }[]>('/team-logos').catch(() => []),
            ]);

            const teamLogos: Record<string, string> = {};
            (logosData || []).forEach(item => {
                if (item.teamName) teamLogos[item.teamName] = item.logoUrl;
            });

            return {
                playerStats: playerStats || [],
                playerHeroStats: playerHeroStats || [],
                heroes: heroes || [],
                teamLogos
            };
        } catch (error) {
            console.error('Error fetching player stats:', error);
            return { playerStats: [], playerHeroStats: [], heroes: [], teamLogos: {} };
        }
    },
};

export default serverApi;
