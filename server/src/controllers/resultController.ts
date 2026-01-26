import { Request, Response } from 'express';
import Result from '../models/Result';
import GameStat from '../models/GameStat';
import ResultHistory from '../models/ResultHistory';

// Helper to get username from request
const getUsername = (req: Request): string => {
    return (req as any).user?.username || 'system';
};

export const getResults = async (req: Request, res: Response) => {
    try {
        const results = await Result.find().sort({ matchDay: 1 }).lean();
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

        if (isByeWin) {
            if (req.body.winner === teamBlue || req.body.winner === teamRed) {
                winner = req.body.winner;
                loser = (winner === teamBlue) ? teamRed : teamBlue;
            } else {
                // Fallback: Default to blue win if not specified (though frontend should send it)
                // or handle error. For now, try to use provided loser if available
                if (req.body.loser === teamBlue || req.body.loser === teamRed) {
                    loser = req.body.loser;
                    winner = (loser === teamBlue) ? teamRed : teamBlue;
                }
            }
        } else {
            if (scoreBlue > scoreRed) { winner = teamBlue; loser = teamRed; }
            else { winner = teamRed; loser = teamBlue; }
        }

        const matchId = `${matchDay}_${teamBlue}_vs_${teamRed}`.replace(/\s+/g, '');

        // Check if result already exists (for history tracking)
        const existingResult = await Result.findOne({ matchId });
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
        const result = await Result.findOneAndUpdate({ matchId: matchId }, resultData, { upsert: true, new: true });

        // Log history
        await ResultHistory.create({
            matchId,
            action: isUpdate ? 'update' : 'create',
            previousData: isUpdate ? existingResult?.toObject() : null,
            newData: resultData,
            changedBy: getUsername(req),
            changedAt: new Date()
        });

        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteResult = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.params;

        // Get existing data for history
        const existingResult = await Result.findOne({ matchId });

        if (existingResult) {
            // Log history before delete
            await ResultHistory.create({
                matchId,
                action: 'delete',
                previousData: existingResult.toObject(),
                newData: null,
                changedBy: getUsername(req),
                changedAt: new Date(),
                reason: req.body.reason || 'Manual deletion'
            });
        }

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

        // Get all results for this day to log history
        const dayResults = await Result.find({
            $or: [{ matchDay: parseInt(day) }, { matchDay: day.toString() }]
        });

        // Log each deletion
        for (const result of dayResults) {
            await ResultHistory.create({
                matchId: result.matchId,
                action: 'delete',
                previousData: result.toObject(),
                newData: null,
                changedBy: getUsername(req),
                changedAt: new Date(),
                reason: `Day ${day} reset`
            });
        }

        await Result.deleteMany({ $or: [{ matchDay: parseInt(day) }, { matchDay: day.toString() }] });
        res.json({ message: `Results for day ${day} cleared`, count: dayResults.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// NEW: Get result history
export const getResultHistory = async (req: Request, res: Response) => {
    try {
        const { matchId } = req.query;

        let query = {};
        if (matchId) {
            query = { matchId: matchId as string };
        }

        const history = await ResultHistory.find(query)
            .sort({ changedAt: -1 })
            .limit(100);

        res.json(history);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// NEW: Get recent changes
export const getRecentChanges = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;

        const recentChanges = await ResultHistory.find()
            .sort({ changedAt: -1 })
            .limit(limit);

        res.json(recentChanges);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// NEW: Validate if result can be saved (check for conflicts)
export const validateResult = async (req: Request, res: Response) => {
    try {
        const { matchDay, teamBlue, teamRed } = req.body;

        const matchId = `${matchDay}_${teamBlue.trim()}_vs_${teamRed.trim()}`.replace(/\s+/g, '');
        const existingResult = await Result.findOne({ matchId });

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
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
