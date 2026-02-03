// API Response Types
export interface Team {
    _id: string;
    name: string;
    logo?: string;
    logoShort?: string;
    description?: string;
}

export interface Standing {
    team: string; // Team Name
    played: number;
    won: number;
    lost: number;
    points: number;
    gamesWon: number;
    gamesLost: number;
    gameDiff: number;
}


export interface Schedule {
    _id: string;
    teams: string[];
    potA: string[];
    potB: string[];
    schedule: MatchDay[];
    createdAt: string;
}

export interface MatchDay {
    day: number;
    matches: Match[];
}

export interface Match {
    teamA: string;
    teamB: string;
}

export interface Result {
    _id: string;
    matchId: string;
    matchDay: number | string;
    teamBlue: string;
    teamRed: string;
    scoreBlue: number;
    scoreRed: number;
    winner: string;
    loser: string;
    gameDetails: GameDetail[];
    isByeWin: boolean;
    mvp?: string; // Added: MVP player name
    createdAt: string;
}

export interface GameDetail {
    gameNumber: number;
    winner: string;
    duration?: number;
}

export interface GameStat {
    _id: string;
    matchId: string;
    gameNumber: number;
    teamName: string;
    playerName: string;
    heroName: string;
    kills: number;
    deaths: number;
    assists: number;
    mvp: boolean;
    gameDuration: number;
    win: boolean;
    createdAt: string;
}

export interface PlayerStat {
    realName: string;
    playerName: string;
    teamName: string;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    gamesPlayed: number;
    mvpCount: number;
    wins: number;
    winRate: number;
    avgKillsPerGame: number;
    avgDeathsPerGame: number;
    avgAssistsPerGame: number;
    mvpRate: number;
    kda: number;
}

export interface TeamStat {
    teamName: string;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    mvpCount: number;
    realGamesPlayed: number;
    realWins: number;
    avgKillsPerGame: number;
    avgDeathsPerGame: number;
    avgAssistsPerGame: number;
    avgDuration: number;
    kda: number;
    winRate: number;
    realLosses: number;
}

export interface SeasonStats {
    totalMatches: number;
    totalGames: number;
    avgGameDuration: number;
    highestKillGame: {
        match: string;
        kills: number;
        gameNumber?: number;
    };
    longestGame: {
        match: string;
        duration: number;
        gameNumber?: number;
    };
    topMVPPlayer: {
        name: string;
        team: string;
        count: number;
    } | null;
    topKillerPlayer: {
        name: string;
        team: string;
        kills: number;
    } | null;
    bestTeam: {
        name: string;
        winRate: string;
        wins: number;
        games: number;
    } | null;
    mostPickedHero: {
        name: string;
        picks: number;
        winRate: string;
    } | null;
    bestWinRateHero: {
        name: string;
        picks: number;
        winRate: string;
    } | null;
}

export interface Player {
    _id: string;
    name: string;
    grade?: string;
    team?: string;
    inGameName?: string;
    previousIGNs: string[];
    openId?: string;
    createdAt: string;
}

export interface TeamLogo {
    _id: string;
    teamName: string;
    logoUrl: string;
    createdAt: string;
}

export interface Hero {
    _id: string;
    name: string;
    imageUrl?: string;
    createdAt: string;
}

export interface PlayerHeroStat {
    realName: string;
    playerName: string;
    topHeroes: {
        heroName: string;
        gamesPlayed: number;
        wins: number;
        totalKills: number;
        totalDeaths: number;
        totalAssists: number;
    }[];
}

// Aliases for compatibility
export type MatchResult = Result;
export type ScheduleItem = Schedule;

// Auth Types
export interface AuthUser {
    username: string;
    role: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    expiresIn: string;
}

export interface VerifyResponse {
    valid: boolean;
    user: AuthUser;
}

// API Error
export interface ApiError {
    error: string;
    details?: { path: string; message: string }[];
}
