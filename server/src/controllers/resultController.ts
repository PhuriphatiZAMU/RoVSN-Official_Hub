import { Request, Response } from 'express';
import Result from '../models/Result';
import GameStat from '../models/GameStat';

export const getResults = async (req: Request, res: Response) => {
    try {
        const results = await Result.find().sort({ matchDay: 1 });
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const saveResult = async (req: Request, res: Response) => {
    try {
        let { matchDay, teamBlue, teamRed, scoreBlue, scoreRed, gameDetails, isByeWin } = req.body;

        // Sanitize Input
        teamBlue = teamBlue.trim();
        teamRed = teamRed.trim();

        let winner: string | null = null;
        let loser: string | null = null;

        if (scoreBlue > scoreRed) { winner = teamBlue; loser = teamRed; }
        else { winner = teamRed; loser = teamBlue; }

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

        const result = await Result.findOneAndUpdate({ matchId: matchId }, resultData, { upsert: true, new: true });
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteResult = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;
        await Result.deleteOne({ matchId });
        await GameStat.deleteMany({ matchId });
        res.json({ message: `Result ${matchId} deleted` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const resetDayResults = async (req: Request, res: Response) => {
    try {
        const day = req.params.day as string;
        await Result.deleteMany({ $or: [{ matchDay: parseInt(day) }, { matchDay: day.toString() }] });
        res.json({ message: `Results for day ${day} cleared` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
