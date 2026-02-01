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
exports.getDetailedStandings = exports.getStandings = void 0;
const Result_1 = __importDefault(require("../models/Result"));
/**
 * Get standings calculated directly from database results
 * Excludes Knockout stages (matchDay >= 90) from standings calculation
 */
const getStandings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use MongoDB Aggregation to calculate standings directly from results
        const standings = yield Result_1.default.aggregate([
            // Step 1: Filter out knockout stages (matchDay >= 90)
            {
                $match: {
                    $expr: {
                        $lt: [{ $toInt: { $ifNull: ['$matchDay', 0] } }, 90]
                    }
                }
            },
            // Step 2: Create two records per result (one for each team)
            {
                $facet: {
                    // Blue team perspective
                    blueTeam: [
                        {
                            $project: {
                                teamName: '$teamBlue',
                                opponent: '$teamRed',
                                scoreFor: '$scoreBlue',
                                scoreAgainst: '$scoreRed',
                                isByeWin: { $ifNull: ['$isByeWin', false] },
                                winner: '$winner',
                                loser: '$loser'
                            }
                        }
                    ],
                    // Red team perspective
                    redTeam: [
                        {
                            $project: {
                                teamName: '$teamRed',
                                opponent: '$teamBlue',
                                scoreFor: '$scoreRed',
                                scoreAgainst: '$scoreBlue',
                                isByeWin: { $ifNull: ['$isByeWin', false] },
                                winner: '$winner',
                                loser: '$loser'
                            }
                        }
                    ]
                }
            },
            // Step 3: Combine both perspectives
            {
                $project: {
                    allTeamRecords: { $concatArrays: ['$blueTeam', '$redTeam'] }
                }
            },
            { $unwind: '$allTeamRecords' },
            { $replaceRoot: { newRoot: '$allTeamRecords' } },
            // Step 4: Calculate stats per team
            {
                $group: {
                    _id: '$teamName',
                    // Total matches played
                    p: { $sum: 1 },
                    // Wins (when team is winner)
                    w: {
                        $sum: {
                            $cond: [{ $eq: ['$teamName', '$winner'] }, 1, 0]
                        }
                    },
                    // Losses (when team is loser)
                    l: {
                        $sum: {
                            $cond: [{ $eq: ['$teamName', '$loser'] }, 1, 0]
                        }
                    },
                    // Game Difference (only for non-bye matches)
                    gd: {
                        $sum: {
                            $cond: [
                                '$isByeWin',
                                0, // Bye wins don't count for GD
                                { $subtract: ['$scoreFor', '$scoreAgainst'] }
                            ]
                        }
                    },
                    // Points (3 for win)
                    pts: {
                        $sum: {
                            $cond: [{ $eq: ['$teamName', '$winner'] }, 3, 0]
                        }
                    }
                }
            },
            // Step 5: Sort by Points > GD > Name
            {
                $sort: {
                    pts: -1,
                    gd: -1,
                    _id: 1
                }
            },
            // Step 6: Format output
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    p: 1,
                    w: 1,
                    l: 1,
                    gd: 1,
                    pts: 1
                }
            }
        ]);
        res.json(standings);
    }
    catch (error) {
        console.error('Standings calculation error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.getStandings = getStandings;
/**
 * Get standings with additional details (form, streak, etc.)
 */
const getDetailedStandings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First get basic standings
        const basicStandings = yield Result_1.default.aggregate([
            // Filter out knockout stages
            {
                $match: {
                    $expr: {
                        $lt: [{ $toInt: { $ifNull: ['$matchDay', 0] } }, 90]
                    }
                }
            },
            // Process teams
            {
                $facet: {
                    blueTeam: [
                        {
                            $project: {
                                teamName: '$teamBlue',
                                scoreFor: '$scoreBlue',
                                scoreAgainst: '$scoreRed',
                                isByeWin: { $ifNull: ['$isByeWin', false] },
                                winner: '$winner',
                                loser: '$loser',
                                matchDay: '$matchDay'
                            }
                        }
                    ],
                    redTeam: [
                        {
                            $project: {
                                teamName: '$teamRed',
                                scoreFor: '$scoreRed',
                                scoreAgainst: '$scoreBlue',
                                isByeWin: { $ifNull: ['$isByeWin', false] },
                                winner: '$winner',
                                loser: '$loser',
                                matchDay: '$matchDay'
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    allTeamRecords: { $concatArrays: ['$blueTeam', '$redTeam'] }
                }
            },
            { $unwind: '$allTeamRecords' },
            { $replaceRoot: { newRoot: '$allTeamRecords' } },
            // Sort by matchDay descending to get recent form
            { $sort: { matchDay: -1 } },
            // Group and calculate
            {
                $group: {
                    _id: '$teamName',
                    p: { $sum: 1 },
                    w: { $sum: { $cond: [{ $eq: ['$teamName', '$winner'] }, 1, 0] } },
                    l: { $sum: { $cond: [{ $eq: ['$teamName', '$loser'] }, 1, 0] } },
                    gd: {
                        $sum: {
                            $cond: ['$isByeWin', 0, { $subtract: ['$scoreFor', '$scoreAgainst'] }]
                        }
                    },
                    pts: { $sum: { $cond: [{ $eq: ['$teamName', '$winner'] }, 3, 0] } },
                    // Last 5 matches form (W/L) - collect results
                    recentResults: {
                        $push: {
                            $cond: [{ $eq: ['$teamName', '$winner'] }, 'W', 'L']
                        }
                    },
                    // Games For (total score for)
                    gf: {
                        $sum: {
                            $cond: ['$isByeWin', 0, '$scoreFor']
                        }
                    },
                    // Games Against (total score against)
                    ga: {
                        $sum: {
                            $cond: ['$isByeWin', 0, '$scoreAgainst']
                        }
                    }
                }
            },
            // Add form string (last 5)
            {
                $addFields: {
                    form: { $slice: ['$recentResults', 5] }
                }
            },
            {
                $sort: { pts: -1, gd: -1, gf: -1, _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    p: 1,
                    w: 1,
                    l: 1,
                    gf: 1,
                    ga: 1,
                    gd: 1,
                    pts: 1,
                    form: 1
                }
            }
        ]);
        res.json(basicStandings);
    }
    catch (error) {
        console.error('Detailed standings calculation error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.getDetailedStandings = getDetailedStandings;
