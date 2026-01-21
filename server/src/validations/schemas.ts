import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required')
});

// Schedule Schemas
export const createScheduleSchema = z.object({
    teams: z.array(z.string()).optional(),
    potA: z.array(z.string()).optional(),
    potB: z.array(z.string()).optional(),
    schedule: z.array(z.any()).optional()
});

// Result Schemas
export const saveResultSchema = z.object({
    matchDay: z.union([z.number(), z.string()]),
    teamBlue: z.string().min(1, 'Team Blue is required'),
    teamRed: z.string().min(1, 'Team Red is required'),
    scoreBlue: z.number().int().min(0),
    scoreRed: z.number().int().min(0),
    gameDetails: z.array(z.any()).optional(),
    isByeWin: z.boolean().optional()
});

export const matchIdParamSchema = z.object({
    matchId: z.string().min(1, 'matchId is required')
});

export const dayParamSchema = z.object({
    day: z.string().min(1, 'day is required')
});

// Stats Schemas
export const gameStatSchema = z.object({
    matchId: z.string().min(1),
    gameNumber: z.number().int().positive(),
    teamName: z.string().min(1),
    playerName: z.string().min(1),
    heroName: z.string().min(1),
    kills: z.number().int().min(0),
    deaths: z.number().int().min(0),
    assists: z.number().int().min(0),
    mvp: z.boolean(),
    gameDuration: z.number().min(0),
    win: z.boolean()
});

export const saveStatsSchema = z.array(gameStatSchema).nonempty('Data must be a non-empty array');

export const matchIdQuerySchema = z.object({
    matchId: z.string().min(1, 'matchId is required')
});

// Player Schemas
export const playerSchema = z.object({
    name: z.string().min(1),
    grade: z.string().optional(),
    team: z.string().optional(),
    inGameName: z.string().optional(),
    previousIGNs: z.array(z.string()).optional(),
    openId: z.string().optional()
});

export const importPlayersSchema = z.array(playerSchema).nonempty();

export const playerIdParamSchema = z.object({
    playerId: z.string().min(1, 'playerId is required')
});

export const previousIGNSchema = z.object({
    previousIGN: z.string().min(1, 'previousIGN is required')
});

export const newIGNSchema = z.object({
    newIGN: z.string().min(1, 'newIGN is required')
});

// Team Logo Schemas
export const teamLogoSchema = z.object({
    teamName: z.string().min(1, 'teamName is required'),
    logoUrl: z.string().url('logoUrl must be a valid URL')
});

export const teamNameParamSchema = z.object({
    teamName: z.string().min(1, 'teamName is required')
});
