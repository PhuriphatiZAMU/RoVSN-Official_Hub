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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const PlayerPool_1 = __importDefault(require("../models/PlayerPool"));
const GameStat_1 = __importDefault(require("../models/GameStat"));
// Explicitly load .env from server root
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri)
            throw new Error("MONGO_URI is not defined");
        console.log("Connecting to MongoDB...");
        yield mongoose_1.default.connect(uri);
        console.log("Connected.");
        const playerName = "LIONeLMESSI";
        const regex = new RegExp(`^${playerName}$`, 'i');
        // 1. Delete from PlayerPool
        const poolResult = yield PlayerPool_1.default.deleteMany({
            $or: [
                { inGameName: { $regex: regex } },
                { name: { $regex: regex } }
            ]
        });
        console.log(`PlayerPool: Deleted ${poolResult.deletedCount} records.`);
        // 2. Delete from GameStat
        // Check finding first to be sure
        const statsFound = yield GameStat_1.default.find({ playerName: { $regex: regex } });
        console.log(`Found ${statsFound.length} GameStat records for ${playerName}.`);
        if (statsFound.length > 0) {
            const statResult = yield GameStat_1.default.deleteMany({ playerName: { $regex: regex } });
            console.log(`GameStat: Deleted ${statResult.deletedCount} records.`);
        }
    }
    catch (error) {
        console.error("Error:", error);
    }
    finally {
        yield mongoose_1.default.disconnect();
    }
});
run();
