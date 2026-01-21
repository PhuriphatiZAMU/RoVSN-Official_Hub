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
exports.resetDayResults = exports.deleteResult = exports.saveResult = exports.getResults = void 0;
const Result_1 = __importDefault(require("../models/Result"));
const GameStat_1 = __importDefault(require("../models/GameStat"));
const getResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield Result_1.default.find().sort({ matchDay: 1 });
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
        if (scoreBlue > scoreRed) {
            winner = teamBlue;
            loser = teamRed;
        }
        else {
            winner = teamRed;
            loser = teamBlue;
        }
        const matchId = `${matchDay}_${teamBlue}_vs_${teamRed}`.replace(/\s+/g, '');
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
        const result = yield Result_1.default.findOneAndUpdate({ matchId: matchId }, resultData, { upsert: true, new: true });
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
        yield Result_1.default.deleteMany({ $or: [{ matchDay: parseInt(day) }, { matchDay: day.toString() }] });
        res.json({ message: `Results for day ${day} cleared` });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.resetDayResults = resetDayResults;
