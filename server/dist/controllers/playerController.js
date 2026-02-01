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
exports.deletePlayer = exports.updatePlayerFull = exports.createPlayer = exports.renameTeam = exports.updateIGN = exports.addPreviousIGN = exports.getUnmatchedIGNs = exports.clearAllPlayers = exports.importPlayers = exports.getPlayers = void 0;
const PlayerPool_1 = __importDefault(require("../models/PlayerPool"));
const GameStat_1 = __importDefault(require("../models/GameStat"));
const getPlayers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield PlayerPool_1.default.find().sort({ team: 1, name: 1 });
        res.json(players);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPlayers = getPlayers;
const importPlayers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = req.body;
        const result = yield PlayerPool_1.default.insertMany(players);
        res.status(201).json({ message: `Imported ${result.length} players`, count: result.length });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.importPlayers = importPlayers;
const clearAllPlayers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield PlayerPool_1.default.deleteMany({});
        res.json({ message: "All players cleared" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.clearAllPlayers = clearAllPlayers;
const getUnmatchedIGNs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const statsIGNs = yield GameStat_1.default.distinct('playerName');
        const players = yield PlayerPool_1.default.find({});
        const knownIGNs = new Set();
        players.forEach((p) => {
            if (p.name)
                knownIGNs.add(p.name);
            if (p.inGameName)
                knownIGNs.add(p.inGameName);
            (p.previousIGNs || []).forEach((ign) => knownIGNs.add(ign));
        });
        const unmatchedIGNs = statsIGNs.filter((ign) => !knownIGNs.has(ign));
        const result = yield Promise.all(unmatchedIGNs.map((ign) => __awaiter(void 0, void 0, void 0, function* () {
            const count = yield GameStat_1.default.countDocuments({ playerName: ign });
            const sample = yield GameStat_1.default.findOne({ playerName: ign });
            return { ign, gamesCount: count, team: (sample === null || sample === void 0 ? void 0 : sample.teamName) || 'Unknown' };
        })));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getUnmatchedIGNs = getUnmatchedIGNs;
const addPreviousIGN = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId } = req.params;
        const { previousIGN } = req.body;
        if (!previousIGN)
            return res.status(400).json({ error: 'previousIGN is required' });
        const player = yield PlayerPool_1.default.findByIdAndUpdate(playerId, { $addToSet: { previousIGNs: previousIGN } }, { new: true });
        if (!player)
            return res.status(404).json({ error: 'Player not found' });
        res.json({ message: `Added "${previousIGN}" to ${player.name}'s previous IGNs`, player });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.addPreviousIGN = addPreviousIGN;
const updateIGN = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId } = req.params;
        const { newIGN, team } = req.body; // Allow updating team too for removing players
        if (!newIGN && team === undefined)
            return res.status(400).json({ error: 'Data is required' });
        const player = yield PlayerPool_1.default.findById(playerId);
        if (!player)
            return res.status(404).json({ error: 'Player not found' });
        if (newIGN) {
            if (player.inGameName && player.inGameName !== newIGN) {
                player.previousIGNs = player.previousIGNs || [];
                if (!player.previousIGNs.includes(player.inGameName)) {
                    player.previousIGNs.push(player.inGameName);
                }
            }
            player.inGameName = newIGN;
        }
        if (team !== undefined) {
            player.team = team;
        }
        yield player.save();
        res.json({ message: `Updated player`, player });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateIGN = updateIGN;
const renameTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { oldName, newName } = req.body;
        if (!oldName || !newName)
            return res.status(400).json({ error: 'Old and new team names are required' });
        const result = yield PlayerPool_1.default.updateMany({ team: oldName }, { $set: { team: newName } });
        res.json({
            message: `Renamed team "${oldName}" to "${newName}"`,
            modifiedCount: result.modifiedCount
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.renameTeam = renameTeam;
const createPlayer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const player = yield PlayerPool_1.default.create(req.body);
        res.status(201).json(player);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createPlayer = createPlayer;
const updatePlayerFull = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const player = yield PlayerPool_1.default.findByIdAndUpdate(id, req.body, { new: true });
        if (!player)
            return res.status(404).json({ error: 'Player not found' });
        res.json(player);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updatePlayerFull = updatePlayerFull;
const deletePlayer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const player = yield PlayerPool_1.default.findByIdAndDelete(id);
        if (!player)
            return res.status(404).json({ error: 'Player not found' });
        res.json({ message: 'Player deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deletePlayer = deletePlayer;
