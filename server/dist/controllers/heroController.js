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
exports.clearAllHeroes = exports.uploadHeroes = exports.getHeroes = void 0;
const Hero_1 = __importDefault(require("../models/Hero"));
const path_1 = __importDefault(require("path"));
const getHeroes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const heroes = yield Hero_1.default.find().sort({ name: 1 });
        res.json(heroes);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getHeroes = getHeroes;
const uploadHeroes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.files || !Array.isArray(req.files)) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        const results = [];
        for (const file of req.files) {
            const heroName = path_1.default.basename(file.originalname, path_1.default.extname(file.originalname));
            const imageUrl = file.path || `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
            const hero = yield Hero_1.default.findOneAndUpdate({ name: heroName }, { name: heroName, imageUrl: imageUrl }, { upsert: true, new: true });
            results.push(hero);
        }
        res.status(201).json({ message: `Uploaded ${results.length} heroes`, heroes: results });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.uploadHeroes = uploadHeroes;
const clearAllHeroes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Hero_1.default.deleteMany({});
        res.json({ message: 'All heroes cleared' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.clearAllHeroes = clearAllHeroes;
