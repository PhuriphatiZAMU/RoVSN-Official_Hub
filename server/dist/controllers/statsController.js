"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerHeroStats = exports.getMatchStats = exports.saveStats = exports.getSeasonStats = exports.getTeamStats = exports.getPlayerStats = void 0;
const GameStat_1 = __importDefault(require("../models/GameStat"));
const Result_1 = __importDefault(require("../models/Result"));
// GET: Player Stats (Enhanced)
const getPlayerStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield GameStat_1.default.aggregate([
            // Step 1: Lookup PlayerPool to get realName
            {
                $lookup: {
                    from: 'playerpool',
                    let: { ign: '$playerName' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$inGameName', '$$ign'] },
                                        { $eq: ['$name', '$$ign'] },
                                        { $in: ['$$ign', { $ifNull: ['$previousIGNs', []] }] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'playerInfo'
                }
            },
            // Step 2: Add realName field
            {
                $addFields: {
                    realName: {
                        $cond: [
                            { $gt: [{ $size: '$playerInfo' }, 0] },
                            { $arrayElemAt: ['$playerInfo.name', 0] },
                            '$playerName'
                        ]
                    },
                    displayName: '$playerName'
                }
            },
            // Step 3: Group by realName + teamName
            {
                $group: {
                    _id: { realName: '$realName', teamName: '$teamName' },
                    playerName: { $last: '$displayName' },
                    totalKills: { $sum: '$kills' },
                    totalDeaths: { $sum: '$deaths' },
                    totalAssists: { $sum: '$assists' },
                    gamesPlayed: { $sum: 1 },
                    mvpCount: { $sum: { $cond: ['$mvp', 1, 0] } },
                    wins: { $sum: { $cond: ['$win', 1, 0] } },
                    totalDuration: { $sum: '$gameDuration' }
                }
            },
            // Step 4: Project with enhanced stats
            {
                $project: {
                    _id: 0,
                    realName: '$_id.realName',
                    playerName: 1,
                    teamName: '$_id.teamName',
                    totalKills: 1,
                    totalDeaths: 1,
                    totalAssists: 1,
                    gamesPlayed: 1,
                    mvpCount: 1,
                    wins: 1,
                    winRate: {
                        $cond: [
                            { $eq: ['$gamesPlayed', 0] },
                            0,
                            { $round: [{ $multiply: [{ $divide: ['$wins', '$gamesPlayed'] }, 100] }, 1] }
                        ]
                    },
                    avgKillsPerGame: {
                        $cond: [
                            { $eq: ['$gamesPlayed', 0] },
                            0,
                            { $round: [{ $divide: ['$totalKills', '$gamesPlayed'] }, 1] }
                        ]
                    },
                    avgDeathsPerGame: {
                        $cond: [
                            { $eq: ['$gamesPlayed', 0] },
                            0,
                            { $round: [{ $divide: ['$totalDeaths', '$gamesPlayed'] }, 1] }
                        ]
                    },
                    avgAssistsPerGame: {
                        $cond: [
                            { $eq: ['$gamesPlayed', 0] },
                            0,
                            { $round: [{ $divide: ['$totalAssists', '$gamesPlayed'] }, 1] }
                        ]
                    },
                    mvpRate: {
                        $cond: [
                            { $eq: ['$gamesPlayed', 0] },
                            0,
                            { $round: [{ $multiply: [{ $divide: ['$mvpCount', '$gamesPlayed'] }, 100] }, 1] }
                        ]
                    },
                    kda: {
                        $cond: [
                            { $eq: ['$totalDeaths', 0] },
                            { $add: ['$totalKills', '$totalAssists'] },
                            { $round: [{ $divide: [{ $add: ['$totalKills', '$totalAssists'] }, '$totalDeaths'] }, 2] }
                        ]
                    }
                }
            },
            { $sort: { kda: -1, totalKills: -1, mvpCount: -1 } }
        ]);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPlayerStats = getPlayerStats;
// GET: Team Stats (Enhanced)
const getTeamStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield GameStat_1.default.aggregate([
            {
                $group: {
                    _id: "$teamName",
                    totalKills: { $sum: "$kills" },
                    totalDeaths: { $sum: "$deaths" },
                    totalAssists: { $sum: "$assists" },
                    gamesPlayed: { $sum: 1 },
                    wins: { $sum: { $cond: ["$win", 1, 0] } },
                    mvpCount: { $sum: { $cond: ["$mvp", 1, 0] } },
                    totalDuration: { $sum: "$gameDuration" }
                }
            },
            {
                $project: {
                    teamName: "$_id",
                    totalKills: 1,
                    totalDeaths: 1,
                    totalAssists: 1,
                    mvpCount: 1,
                    realGamesPlayed: { $ceil: { $divide: ["$gamesPlayed", 5] } },
                    realWins: { $ceil: { $divide: ["$wins", 5] } },
                    avgKillsPerGame: {
                        $cond: [
                            { $eq: ["$gamesPlayed", 0] },
                            0,
                            { $round: [{ $divide: ["$totalKills", { $divide: ["$gamesPlayed", 5] }] }, 1] }
                        ]
                    },
                    avgDeathsPerGame: {
                        $cond: [
                            { $eq: ["$gamesPlayed", 0] },
                            0,
                            { $round: [{ $divide: ["$totalDeaths", { $divide: ["$gamesPlayed", 5] }] }, 1] }
                        ]
                    },
                    avgAssistsPerGame: {
                        $cond: [
                            { $eq: ["$gamesPlayed", 0] },
                            0,
                            { $round: [{ $divide: ["$totalAssists", { $divide: ["$gamesPlayed", 5] }] }, 1] }
                        ]
                    },
                    avgDuration: {
                        $cond: [
                            { $eq: ["$gamesPlayed", 0] },
                            0,
                            { $divide: ["$totalDuration", { $divide: ["$gamesPlayed", 5] }] }
                        ]
                    },
                    kda: {
                        $cond: [
                            { $eq: ["$totalDeaths", 0] },
                            { $add: ["$totalKills", "$totalAssists"] },
                            { $divide: [{ $add: ["$totalKills", "$totalAssists"] }, "$totalDeaths"] }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    winRate: {
                        $cond: [
                            { $eq: ["$realGamesPlayed", 0] },
                            0,
                            { $multiply: [{ $divide: ["$realWins", "$realGamesPlayed"] }, 100] }
                        ]
                    },
                    realLosses: { $subtract: ["$realGamesPlayed", "$realWins"] }
                }
            },
            { $sort: { winRate: -1, realWins: -1, kda: -1, totalKills: -1, teamName: 1 } }
        ]);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getTeamStats = getTeamStats;
// GET: Season Stats
const getSeasonStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        // 1. Total Matches & Games
        const totalMatches = yield Result_1.default.countDocuments({ isByeWin: { $ne: true } });
        const allResults = yield Result_1.default.find({ isByeWin: { $ne: true } });
        let totalGames = 0;
        allResults.forEach((r) => {
            var _a;
            totalGames += (((_a = r.gameDetails) === null || _a === void 0 ? void 0 : _a.length) || 0) || (r.scoreBlue + r.scoreRed) || 0;
        });
        // 2. Avg Game Duration
        const durationStats = yield GameStat_1.default.aggregate([
            { $match: { gameDuration: { $gt: 0 } } },
            { $group: { _id: { matchId: "$matchId", gameNumber: "$gameNumber" }, avgDuration: { $avg: "$gameDuration" } } },
            { $group: { _id: null, avgGameDuration: { $avg: "$avgDuration" } } }
        ]);
        const avgGameDuration = ((_a = durationStats[0]) === null || _a === void 0 ? void 0 : _a.avgGameDuration) || 0;
        // 3. Bloodiest Game
        const gameKillStats = yield GameStat_1.default.aggregate([
            { $group: { _id: { matchId: "$matchId", gameNumber: "$gameNumber" }, totalKills: { $sum: "$kills" }, matchId: { $first: "$matchId" }, gameNumber: { $first: "$gameNumber" } } },
            { $sort: { totalKills: -1 } },
            { $limit: 1 }
        ]);
        const highestKillGame = gameKillStats[0]
            ? { match: ((_b = gameKillStats[0].matchId) === null || _b === void 0 ? void 0 : _b.replace(/_/g, ' ').replace('vs', 'vs.')) || 'Unknown', kills: gameKillStats[0].totalKills, gameNumber: gameKillStats[0].gameNumber }
            : { match: '-', kills: 0 };
        // 4. Longest Game
        let longestGame = { match: '-', duration: 0 };
        allResults.forEach((result) => {
            if (result.gameDetails) {
                result.gameDetails.forEach((game, idx) => {
                    if (game.duration && game.duration > longestGame.duration) {
                        longestGame = { match: `${result.teamBlue} vs ${result.teamRed}`, duration: game.duration, gameNumber: idx + 1 };
                    }
                });
            }
        });
        // 5. Top MVP Player
        const topMVP = yield GameStat_1.default.aggregate([
            { $match: { mvp: true } },
            { $lookup: { from: 'playerpool', let: { ign: '$playerName' }, pipeline: [{ $match: { $expr: { $or: [{ $eq: ['$inGameName', '$$ign'] }, { $eq: ['$name', '$$ign'] }, { $in: ['$$ign', { $ifNull: ['$previousIGNs', []] }] }] } } }], as: 'playerInfo' } },
            { $addFields: { realName: { $cond: [{ $gt: [{ $size: '$playerInfo' }, 0] }, { $arrayElemAt: ['$playerInfo.name', 0] }, '$playerName'] } } },
            { $group: { _id: '$realName', mvpCount: { $sum: 1 }, teamName: { $last: '$teamName' }, displayName: { $last: '$playerName' } } },
            { $sort: { mvpCount: -1 } },
            { $limit: 1 }
        ]);
        const topMVPPlayer = topMVP[0] ? { name: topMVP[0]._id, team: topMVP[0].teamName, count: topMVP[0].mvpCount } : null;
        // 6. Top Killer Player
        const topKiller = yield GameStat_1.default.aggregate([
            { $lookup: { from: 'playerpool', let: { ign: '$playerName' }, pipeline: [{ $match: { $expr: { $or: [{ $eq: ['$inGameName', '$$ign'] }, { $eq: ['$name', '$$ign'] }, { $in: ['$$ign', { $ifNull: ['$previousIGNs', []] }] }] } } }], as: 'playerInfo' } },
            { $addFields: { realName: { $cond: [{ $gt: [{ $size: '$playerInfo' }, 0] }, { $arrayElemAt: ['$playerInfo.name', 0] }, '$playerName'] } } },
            { $group: { _id: '$realName', totalKills: { $sum: '$kills' }, teamName: { $last: '$teamName' } } },
            { $sort: { totalKills: -1 } },
            { $limit: 1 }
        ]);
        const topKillerPlayer = topKiller[0] ? { name: topKiller[0]._id, team: topKiller[0].teamName, kills: topKiller[0].totalKills } : null;
        // 7. Best Team
        const teamStats = yield GameStat_1.default.aggregate([
            { $group: { _id: "$teamName", gamesPlayed: { $sum: 1 }, wins: { $sum: { $cond: ["$win", 1, 0] } } } },
            { $addFields: { realGames: { $ceil: { $divide: ["$gamesPlayed", 5] } }, realWins: { $ceil: { $divide: ["$wins", 5] } } } },
            { $match: { realGames: { $gte: 2 } } },
            { $addFields: { winRate: { $cond: [{ $eq: ["$realGames", 0] }, 0, { $multiply: [{ $divide: ["$realWins", "$realGames"] }, 100] }] } } },
            { $sort: { winRate: -1, realWins: -1 } },
            { $limit: 1 }
        ]);
        const bestTeam = teamStats[0] ? { name: teamStats[0]._id, winRate: (_c = teamStats[0].winRate) === null || _c === void 0 ? void 0 : _c.toFixed(1), wins: teamStats[0].realWins, games: teamStats[0].realGames } : null;
        // 8. Most Picked Hero
        const heroStats = yield GameStat_1.default.aggregate([
            { $group: { _id: "$heroName", pickCount: { $sum: 1 }, wins: { $sum: { $cond: ["$win", 1, 0] } } } },
            { $addFields: { winRate: { $cond: [{ $eq: ["$pickCount", 0] }, 0, { $multiply: [{ $divide: ["$wins", "$pickCount"] }, 100] }] } } },
            { $sort: { pickCount: -1 } },
            { $limit: 1 }
        ]);
        const mostPickedHero = heroStats[0] ? { name: heroStats[0]._id, picks: heroStats[0].pickCount, winRate: (_d = heroStats[0].winRate) === null || _d === void 0 ? void 0 : _d.toFixed(1) } : null;
        // 9. Highest Win Rate Hero (min 5 picks)
        const heroWinRateStats = yield GameStat_1.default.aggregate([
            { $group: { _id: "$heroName", pickCount: { $sum: 1 }, wins: { $sum: { $cond: ["$win", 1, 0] } } } },
            { $match: { pickCount: { $gte: 5 } } },
            { $addFields: { winRate: { $cond: [{ $eq: ["$pickCount", 0] }, 0, { $multiply: [{ $divide: ["$wins", "$pickCount"] }, 100] }] } } },
            { $sort: { winRate: -1, pickCount: -1 } },
            { $limit: 1 }
        ]);
        const bestWinRateHero = heroWinRateStats[0] ? { name: heroWinRateStats[0]._id, picks: heroWinRateStats[0].pickCount, winRate: (_e = heroWinRateStats[0].winRate) === null || _e === void 0 ? void 0 : _e.toFixed(1) } : null;
        res.json({
            totalMatches,
            totalGames,
            avgGameDuration,
            highestKillGame,
            longestGame,
            topMVPPlayer,
            topKillerPlayer,
            bestTeam,
            mostPickedHero,
            bestWinRateHero
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getSeasonStats = getSeasonStats;
// POST: Save Stats
const saveStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const statsArray = req.body;
        if (!Array.isArray(statsArray) || statsArray.length === 0) {
            return res.status(400).json({ error: "Data must be a non-empty array" });
        }
        const matchIds = [...new Set(statsArray.map((s) => s.matchId))];
        yield GameStat_1.default.deleteMany({ matchId: { $in: matchIds } });
        const savedStats = yield GameStat_1.default.insertMany(statsArray);
        res.status(201).json({ message: `Saved ${savedStats.length} stats`, count: savedStats.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.saveStats = saveStats;
// GET: Stats for a match
const getMatchStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { matchId } = req.query;
        if (!matchId)
            return res.status(400).json({ error: 'matchId required' });
        const stats = yield GameStat_1.default.find({ matchId }).sort({ gameNumber: 1, teamName: 1 });
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getMatchStats = getMatchStats;
// GET: Player Hero Stats
const getPlayerHeroStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield GameStat_1.default.aggregate([
            {
                $lookup: {
                    from: 'playerpool',
                    let: { ign: '$playerName' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$inGameName', '$$ign'] },
                                        { $eq: ['$name', '$$ign'] },
                                        { $in: ['$$ign', { $ifNull: ['$previousIGNs', []] }] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'playerInfo'
                }
            },
            {
                $addFields: {
                    realName: {
                        $cond: [
                            { $gt: [{ $size: '$playerInfo' }, 0] },
                            { $arrayElemAt: ['$playerInfo.name', 0] },
                            '$playerName'
                        ]
                    },
                    displayName: '$playerName'
                }
            },
            {
                $group: {
                    _id: { realName: '$realName', heroName: '$heroName' },
                    playerName: { $last: '$displayName' },
                    gamesPlayed: { $sum: 1 },
                    wins: { $sum: { $cond: ['$win', 1, 0] } },
                    totalKills: { $sum: '$kills' },
                    totalDeaths: { $sum: '$deaths' },
                    totalAssists: { $sum: '$assists' }
                }
            },
            { $sort: { gamesPlayed: -1 } },
            {
                $group: {
                    _id: '$_id.realName',
                    playerName: { $first: '$playerName' },
                    heroes: {
                        $push: {
                            heroName: '$_id.heroName',
                            gamesPlayed: '$gamesPlayed',
                            wins: '$wins',
                            totalKills: '$totalKills',
                            totalDeaths: '$totalDeaths',
                            totalAssists: '$totalAssists'
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    realName: '$_id',
                    playerName: 1,
                    topHeroes: { $slice: ['$heroes', 3] }
                }
            }
        ]);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPlayerHeroStats = getPlayerHeroStats;
