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
exports.validateResult = exports.getRecentChanges = exports.getResultHistory = exports.resetDayResults = exports.deleteResult = exports.saveResult = exports.getResults = void 0;
const Result_1 = __importDefault(require("../models/Result"));
const GameStat_1 = __importDefault(require("../models/GameStat"));
const ResultHistory_1 = __importDefault(require("../models/ResultHistory"));
// Helper to get username from request
const getUsername = (req) => {
    var _a;
    return ((_a = req.user) === null || _a === void 0 ? void 0 : _a.username) || 'system';
};
const getResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield Result_1.default.find().sort({ matchDay: 1 }).lean();
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getResults = getResults;
const saveResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { matchDay, teamBlue, teamRed, scoreBlue, scoreRed, gameDetails, isByeWin } = req.body;
        // Sanitize Input
        teamBlue = teamBlue.trim();
        teamRed = teamRed.trim();
        let winner = null;
        let loser = null;
        if (isByeWin) {
            if (req.body.winner === teamBlue || req.body.winner === teamRed) {
                winner = req.body.winner;
                loser = (winner === teamBlue) ? teamRed : teamBlue;
            }
            else {
                // Fallback: Default to blue win if not specified (though frontend should send it)
                // or handle error. For now, try to use provided loser if available
                if (req.body.loser === teamBlue || req.body.loser === teamRed) {
                    loser = req.body.loser;
                    winner = (loser === teamBlue) ? teamRed : teamBlue;
                }
            }
        }
        else {
            if (scoreBlue > scoreRed) {
                winner = teamBlue;
                loser = teamRed;
            }
            else {
                winner = teamRed;
                loser = teamBlue;
            }
        }
        const matchId = `${matchDay}_${teamBlue}_vs_${teamRed}`.replace(/\s+/g, '');
        // Check if result already exists (for history tracking)
        const existingResult = yield Result_1.default.findOne({ matchId });
        const isUpdate = !!existingResult;
        const resultData = {
            matchId,
            matchDay,
            teamBlue,
            teamRed,
            scoreBlue,
            scoreRed,
            winner,
            loser,
            gameDetails: gameDetails || [],
            isByeWin: isByeWin || false
        };
        // Save result
        const result = yield Result_1.default.findOneAndUpdate({ matchId: matchId }, resultData, { upsert: true, new: true });
        // Log history
        yield ResultHistory_1.default.create({
            matchId,
            action: isUpdate ? 'update' : 'create',
            previousData: isUpdate ? existingResult === null || existingResult === void 0 ? void 0 : existingResult.toObject() : null,
            newData: resultData,
            changedBy: getUsername(req),
            changedAt: new Date()
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.saveResult = saveResult;
const deleteResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { matchId } = req.params;
        // Get existing data for history
        const existingResult = yield Result_1.default.findOne({ matchId });
        if (existingResult) {
            // Log history before delete
            yield ResultHistory_1.default.create({
                matchId,
                action: 'delete',
                previousData: existingResult.toObject(),
                newData: null,
                changedBy: getUsername(req),
                changedAt: new Date(),
                reason: req.body.reason || 'Manual deletion'
            });
        }
        yield Result_1.default.deleteOne({ matchId });
        yield GameStat_1.default.deleteMany({ matchId });
        res.json({ message: `Result ${matchId} deleted` });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteResult = deleteResult;
const resetDayResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const day = req.params.day;
        // Get all results for this day to log history
        const dayResults = yield Result_1.default.find({
            $or: [{ matchDay: parseInt(day) }, { matchDay: day.toString() }]
        });
        // Log each deletion
        for (const result of dayResults) {
            yield ResultHistory_1.default.create({
                matchId: result.matchId,
                action: 'delete',
                previousData: result.toObject(),
                newData: null,
                changedBy: getUsername(req),
                changedAt: new Date(),
                reason: `Day ${day} reset`
            });
        }
        yield Result_1.default.deleteMany({ $or: [{ matchDay: parseInt(day) }, { matchDay: day.toString() }] });
        res.json({ message: `Results for day ${day} cleared`, count: dayResults.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.resetDayResults = resetDayResults;
// NEW: Get result history
const getResultHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { matchId } = req.query;
        let query = {};
        if (matchId) {
            query = { matchId: matchId };
        }
        const history = yield ResultHistory_1.default.find(query)
            .sort({ changedAt: -1 })
            .limit(100);
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getResultHistory = getResultHistory;
// NEW: Get recent changes
const getRecentChanges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const recentChanges = yield ResultHistory_1.default.find()
            .sort({ changedAt: -1 })
            .limit(limit);
        res.json(recentChanges);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getRecentChanges = getRecentChanges;
// NEW: Validate if result can be saved (check for conflicts)
const validateResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { matchDay, teamBlue, teamRed } = req.body;
        const matchId = `${matchDay}_${teamBlue.trim()}_vs_${teamRed.trim()}`.replace(/\s+/g, '');
        const existingResult = yield Result_1.default.findOne({ matchId });
        res.json({
            exists: !!existingResult,
            matchId,
            existingData: existingResult ? {
                scoreBlue: existingResult.scoreBlue,
                scoreRed: existingResult.scoreRed,
                winner: existingResult.winner,
                isByeWin: existingResult.isByeWin,
                createdAt: existingResult.createdAt
            } : null
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.validateResult = validateResult;
