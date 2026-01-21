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
exports.deleteTeamLogo = exports.saveTeamLogo = exports.getTeamLogos = void 0;
const TeamLogo_1 = __importDefault(require("../models/TeamLogo"));
const getTeamLogos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const logos = yield TeamLogo_1.default.find();
        res.json(logos);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getTeamLogos = getTeamLogos;
const saveTeamLogo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamName, logoUrl } = req.body;
        const result = yield TeamLogo_1.default.findOneAndUpdate({ teamName: teamName }, { logoUrl: logoUrl }, { upsert: true, new: true });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.saveTeamLogo = saveTeamLogo;
const deleteTeamLogo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield TeamLogo_1.default.deleteOne({ teamName: req.params.teamName });
        res.json({ message: 'Logo deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteTeamLogo = deleteTeamLogo;
