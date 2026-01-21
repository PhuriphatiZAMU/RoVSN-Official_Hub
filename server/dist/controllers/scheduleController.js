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
exports.clearAllData = exports.createSchedule = exports.getLatestSchedule = void 0;
const Schedule_1 = __importDefault(require("../models/Schedule"));
const Result_1 = __importDefault(require("../models/Result"));
const getLatestSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const latest = yield Schedule_1.default.findOne().sort({ createdAt: -1 });
        if (!latest)
            return res.status(404).json({ message: "No schedule found" });
        res.json(latest);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getLatestSchedule = getLatestSchedule;
const createSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newSchedule = new Schedule_1.default(req.body);
        const saved = yield newSchedule.save();
        res.status(201).json(saved);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createSchedule = createSchedule;
const clearAllData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Schedule_1.default.deleteMany({});
        yield Result_1.default.deleteMany({});
        res.json({ message: 'All data cleared successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.clearAllData = clearAllData;
