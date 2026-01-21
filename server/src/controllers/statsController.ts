import { Request, Response } from 'express';
import GameStat from '../models/GameStat';
import Result from '../models/Result';

// GET: Player Stats (Enhanced)
export const getPlayerStats = async (req: Request, res: Response) => {
    try {
        const stats = await GameStat.aggregate([
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
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET: Team Stats (Enhanced)
export const getTeamStats = async (req: Request, res: Response) => {
    try {
        const stats = await GameStat.aggregate([
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
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET: Season Stats
export const getSeasonStats = async (req: Request, res: Response) => {
    try {
        // 1. Total Matches & Games
        const totalMatches = await Result.countDocuments({ isByeWin: { $ne: true } });
        const allResults = await Result.find({ isByeWin: { $ne: true } });
        let totalGames = 0;
        allResults.forEach((r: any) => {
            totalGames += (r.gameDetails?.length || 0) || (r.scoreBlue + r.scoreRed) || 0;
        });

        // 2. Avg Game Duration
        const durationStats = await GameStat.aggregate([
            { $match: { gameDuration: { $gt: 0 } } },
            { $group: { _id: { matchId: "$matchId", gameNumber: "$gameNumber" }, avgDuration: { $avg: "$gameDuration" } } },
            { $group: { _id: null, avgGameDuration: { $avg: "$avgDuration" } } }
        ]);
        const avgGameDuration = durationStats[0]?.avgGameDuration || 0;

        // 3. Bloodiest Game
        const gameKillStats = await GameStat.aggregate([
            { $group: { _id: { matchId: "$matchId", gameNumber: "$gameNumber" }, totalKills: { $sum: "$kills" }, matchId: { $first: "$matchId" }, gameNumber: { $first: "$gameNumber" } } },
            { $sort: { totalKills: -1 } },
            { $limit: 1 }
        ]);
        const highestKillGame = gameKillStats[0]
            ? { match: gameKillStats[0].matchId?.replace(/_/g, ' ').replace('vs', 'vs.') || 'Unknown', kills: gameKillStats[0].totalKills, gameNumber: gameKillStats[0].gameNumber }
            : { match: '-', kills: 0 };

        // 4. Longest Game
        let longestGame: { match: string; duration: number; gameNumber?: number } = { match: '-', duration: 0 };
        allResults.forEach((result: any) => {
            if (result.gameDetails) {
                result.gameDetails.forEach((game: any, idx: number) => {
                    if (game.duration && game.duration > longestGame.duration) {
                        longestGame = { match: `${result.teamBlue} vs ${result.teamRed}`, duration: game.duration, gameNumber: idx + 1 };
                    }
                });
            }
        });

        // 5. Top MVP Player
        const topMVP = await GameStat.aggregate([
            { $match: { mvp: true } },
            { $lookup: { from: 'playerpool', let: { ign: '$playerName' }, pipeline: [{ $match: { $expr: { $or: [{ $eq: ['$inGameName', '$$ign'] }, { $eq: ['$name', '$$ign'] }, { $in: ['$$ign', { $ifNull: ['$previousIGNs', []] }] }] } } }], as: 'playerInfo' } },
            { $addFields: { realName: { $cond: [{ $gt: [{ $size: '$playerInfo' }, 0] }, { $arrayElemAt: ['$playerInfo.name', 0] }, '$playerName'] } } },
            { $group: { _id: '$realName', mvpCount: { $sum: 1 }, teamName: { $last: '$teamName' }, displayName: { $last: '$playerName' } } },
            { $sort: { mvpCount: -1 } },
            { $limit: 1 }
        ]);
        const topMVPPlayer = topMVP[0] ? { name: topMVP[0]._id, team: topMVP[0].teamName, count: topMVP[0].mvpCount } : null;

        // 6. Top Killer Player
        const topKiller = await GameStat.aggregate([
            { $lookup: { from: 'playerpool', let: { ign: '$playerName' }, pipeline: [{ $match: { $expr: { $or: [{ $eq: ['$inGameName', '$$ign'] }, { $eq: ['$name', '$$ign'] }, { $in: ['$$ign', { $ifNull: ['$previousIGNs', []] }] }] } } }], as: 'playerInfo' } },
            { $addFields: { realName: { $cond: [{ $gt: [{ $size: '$playerInfo' }, 0] }, { $arrayElemAt: ['$playerInfo.name', 0] }, '$playerName'] } } },
            { $group: { _id: '$realName', totalKills: { $sum: '$kills' }, teamName: { $last: '$teamName' } } },
            { $sort: { totalKills: -1 } },
            { $limit: 1 }
        ]);
        const topKillerPlayer = topKiller[0] ? { name: topKiller[0]._id, team: topKiller[0].teamName, kills: topKiller[0].totalKills } : null;

        // 7. Best Team
        const teamStats = await GameStat.aggregate([
            { $group: { _id: "$teamName", gamesPlayed: { $sum: 1 }, wins: { $sum: { $cond: ["$win", 1, 0] } } } },
            { $addFields: { realGames: { $ceil: { $divide: ["$gamesPlayed", 5] } }, realWins: { $ceil: { $divide: ["$wins", 5] } } } },
            { $match: { realGames: { $gte: 2 } } },
            { $addFields: { winRate: { $cond: [{ $eq: ["$realGames", 0] }, 0, { $multiply: [{ $divide: ["$realWins", "$realGames"] }, 100] }] } } },
            { $sort: { winRate: -1, realWins: -1 } },
            { $limit: 1 }
        ]);
        const bestTeam = teamStats[0] ? { name: teamStats[0]._id, winRate: teamStats[0].winRate?.toFixed(1), wins: teamStats[0].realWins, games: teamStats[0].realGames } : null;

        // 8. Most Picked Hero
        const heroStats = await GameStat.aggregate([
            { $group: { _id: "$heroName", pickCount: { $sum: 1 }, wins: { $sum: { $cond: ["$win", 1, 0] } } } },
            { $addFields: { winRate: { $cond: [{ $eq: ["$pickCount", 0] }, 0, { $multiply: [{ $divide: ["$wins", "$pickCount"] }, 100] }] } } },
            { $sort: { pickCount: -1 } },
            { $limit: 1 }
        ]);
        const mostPickedHero = heroStats[0] ? { name: heroStats[0]._id, picks: heroStats[0].pickCount, winRate: heroStats[0].winRate?.toFixed(1) } : null;

        // 9. Highest Win Rate Hero (min 5 picks)
        const heroWinRateStats = await GameStat.aggregate([
            { $group: { _id: "$heroName", pickCount: { $sum: 1 }, wins: { $sum: { $cond: ["$win", 1, 0] } } } },
            { $match: { pickCount: { $gte: 5 } } },
            { $addFields: { winRate: { $cond: [{ $eq: ["$pickCount", 0] }, 0, { $multiply: [{ $divide: ["$wins", "$pickCount"] }, 100] }] } } },
            { $sort: { winRate: -1, pickCount: -1 } },
            { $limit: 1 }
        ]);
        const bestWinRateHero = heroWinRateStats[0] ? { name: heroWinRateStats[0]._id, picks: heroWinRateStats[0].pickCount, winRate: heroWinRateStats[0].winRate?.toFixed(1) } : null;

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
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// POST: Save Stats
export const saveStats = async (req: Request, res: Response) => {
    try {
        const statsArray = req.body;
        if (!Array.isArray(statsArray) || statsArray.length === 0) {
            return res.status(400).json({ error: "Data must be a non-empty array" });
        }
        const matchIds = [...new Set(statsArray.map((s: any) => s.matchId))];
        await GameStat.deleteMany({ matchId: { $in: matchIds } });
        const savedStats = await GameStat.insertMany(statsArray);
        res.status(201).json({ message: `Saved ${savedStats.length} stats`, count: savedStats.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET: Stats for a match
export const getMatchStats = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.query;
        if (!matchId) return res.status(400).json({ error: 'matchId required' });
        const stats = await GameStat.find({ matchId }).sort({ gameNumber: 1, teamName: 1 });
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// GET: Player Hero Stats
export const getPlayerHeroStats = async (req: Request, res: Response) => {
    try {
        const stats = await GameStat.aggregate([
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
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
