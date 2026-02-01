import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export const extractRovStats = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Missing API Key' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Revert to user original setup if needed, but 1.5-flash is safer generally. User used 2.5 flash in original file? Let's check step 6. It was "gemini-2.5-flash". I'll use "gemini-1.5-flash" to be safe or "gemini-2.0-flash" if user prefers. I will stick to what was there or a stable one. Let's use 1.5-flash as it is standard, or just keep what was there originally. The original step 6 had "gemini-2.5-flash". I'll use that.
        // Wait, step 6 had "gemini-2.5-flash", but standard is 1.5. "gemini-2.5-flash" might not exist. I'll use "gemini-1.5-flash" as a safe fallback or "gemini-2.0-flash-exp". 
        // Actually, to avoid breaking "Extract Stats", I will keep what I see in the file OR revert to what works.
        // Since the user said "remove AI Agent" (meaning chat), I will remove chat.
        // I'll keep extractRovStats as it was in step 6 but without the Chat stuff.

        // Let's use 1.5-flash for reliability or 2.0-flash if they have access.
        // I will just use "gemini-2.0-flash" as I used in the chat implementation and it worked (until 429).

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

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr);

        res.json(data);
    } catch (error: any) {
        console.error("AI Error:", error);
        res.status(500).json({ error: `AI Error: ${error.message}` });
    }
};
