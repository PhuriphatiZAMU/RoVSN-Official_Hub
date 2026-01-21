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
exports.extractRovStats = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const extractRovStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Missing API Key' });
        }
        const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype,
            },
        };
        const prompt = `
        Analyze this RoV (Arena of Valor) scoreboard screenshot.
        Extract for 10 players.
        
        CRITICAL:
        1. **Hero Name**: Look at BOTTOM-LEFT of hero portrait. Return standard hero name.
        2. **Player Name**: OCR carefully.
        3. **Stats**: K / D / A (Ignore Gold/Money).

        Return RAW JSON Array:
        [{ "name": "...", "hero": "...", "side": "blue/red", "k": 0, "d": 0, "a": 0 }]
        `;
        const result = yield model.generateContent([prompt, imagePart]);
        const response = yield result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr);
        res.json(data);
    }
    catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: `AI Error: ${error.message}` });
    }
});
exports.extractRovStats = extractRovStats;
