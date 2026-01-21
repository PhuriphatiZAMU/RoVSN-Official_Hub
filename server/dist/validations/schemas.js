"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamNameParamSchema = exports.teamLogoSchema = exports.newIGNSchema = exports.previousIGNSchema = exports.playerIdParamSchema = exports.importPlayersSchema = exports.playerSchema = exports.matchIdQuerySchema = exports.saveStatsSchema = exports.gameStatSchema = exports.dayParamSchema = exports.matchIdParamSchema = exports.saveResultSchema = exports.createScheduleSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Auth Schemas
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    password: zod_1.z.string().min(1, 'Password is required')
});
// Schedule Schemas
exports.createScheduleSchema = zod_1.z.object({
    teams: zod_1.z.array(zod_1.z.string()).optional(),
    potA: zod_1.z.array(zod_1.z.string()).optional(),
    potB: zod_1.z.array(zod_1.z.string()).optional(),
    schedule: zod_1.z.array(zod_1.z.any()).optional()
});
// Result Schemas
exports.saveResultSchema = zod_1.z.object({
    matchDay: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]),
    teamBlue: zod_1.z.string().min(1, 'Team Blue is required'),
    teamRed: zod_1.z.string().min(1, 'Team Red is required'),
    scoreBlue: zod_1.z.number().int().min(0),
    scoreRed: zod_1.z.number().int().min(0),
    gameDetails: zod_1.z.array(zod_1.z.any()).optional(),
    isByeWin: zod_1.z.boolean().optional()
});
exports.matchIdParamSchema = zod_1.z.object({
    matchId: zod_1.z.string().min(1, 'matchId is required')
});
exports.dayParamSchema = zod_1.z.object({
    day: zod_1.z.string().min(1, 'day is required')
});
// Stats Schemas
exports.gameStatSchema = zod_1.z.object({
    matchId: zod_1.z.string().min(1),
    gameNumber: zod_1.z.number().int().positive(),
    teamName: zod_1.z.string().min(1),
    playerName: zod_1.z.string().min(1),
    heroName: zod_1.z.string().min(1),
    kills: zod_1.z.number().int().min(0),
    deaths: zod_1.z.number().int().min(0),
    assists: zod_1.z.number().int().min(0),
    mvp: zod_1.z.boolean(),
    gameDuration: zod_1.z.number().min(0),
    win: zod_1.z.boolean()
});
exports.saveStatsSchema = zod_1.z.array(exports.gameStatSchema).nonempty('Data must be a non-empty array');
exports.matchIdQuerySchema = zod_1.z.object({
    matchId: zod_1.z.string().min(1, 'matchId is required')
});
// Player Schemas
exports.playerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    grade: zod_1.z.string().optional(),
    team: zod_1.z.string().optional(),
    inGameName: zod_1.z.string().optional(),
    previousIGNs: zod_1.z.array(zod_1.z.string()).optional(),
    openId: zod_1.z.string().optional()
});
exports.importPlayersSchema = zod_1.z.array(exports.playerSchema).nonempty();
exports.playerIdParamSchema = zod_1.z.object({
    playerId: zod_1.z.string().min(1, 'playerId is required')
});
exports.previousIGNSchema = zod_1.z.object({
    previousIGN: zod_1.z.string().min(1, 'previousIGN is required')
});
exports.newIGNSchema = zod_1.z.object({
    newIGN: zod_1.z.string().min(1, 'newIGN is required')
});
// Team Logo Schemas
exports.teamLogoSchema = zod_1.z.object({
    teamName: zod_1.z.string().min(1, 'teamName is required'),
    logoUrl: zod_1.z.string().url('logoUrl must be a valid URL')
});
exports.teamNameParamSchema = zod_1.z.object({
    teamName: zod_1.z.string().min(1, 'teamName is required')
});
