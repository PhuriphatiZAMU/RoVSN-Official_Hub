import { Request, Response } from 'express';
import PlayerPool from '../models/PlayerPool';
import GameStat from '../models/GameStat';

export const getPlayers = async (req: Request, res: Response) => {
    try {
        const players = await PlayerPool.find().sort({ team: 1, name: 1 });
        res.json(players);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const importPlayers = async (req: Request, res: Response) => {
    try {
        const players = req.body;
        const result = await PlayerPool.insertMany(players);
        res.status(201).json({ message: `Imported ${result.length} players`, count: result.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const clearAllPlayers = async (req: Request, res: Response) => {
    try {
        await PlayerPool.deleteMany({});
        res.json({ message: "All players cleared" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getUnmatchedIGNs = async (req: Request, res: Response) => {
    try {
        const statsIGNs = await GameStat.distinct('playerName');
        const players = await PlayerPool.find({});

        const knownIGNs = new Set<string>();
        players.forEach((p: any) => {
            if (p.name) knownIGNs.add(p.name);
            if (p.inGameName) knownIGNs.add(p.inGameName);
            (p.previousIGNs || []).forEach((ign: string) => knownIGNs.add(ign));
        });

        const unmatchedIGNs = statsIGNs.filter((ign: string) => !knownIGNs.has(ign));

        const result = await Promise.all(unmatchedIGNs.map(async (ign: string) => {
            const count = await GameStat.countDocuments({ playerName: ign });
            const sample = await GameStat.findOne({ playerName: ign });
            return { ign, gamesCount: count, team: sample?.teamName || 'Unknown' };
        }));

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const addPreviousIGN = async (req: Request, res: Response) => {
    try {
        const { playerId } = req.params;
        const { previousIGN } = req.body;

        if (!previousIGN) return res.status(400).json({ error: 'previousIGN is required' });

        const player = await PlayerPool.findByIdAndUpdate(
            playerId,
            { $addToSet: { previousIGNs: previousIGN } },
            { new: true }
        );

        if (!player) return res.status(404).json({ error: 'Player not found' });

        res.json({ message: `Added "${previousIGN}" to ${player.name}'s previous IGNs`, player });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateIGN = async (req: Request, res: Response) => {
    try {
        const { playerId } = req.params;
        const { newIGN } = req.body;

        if (!newIGN) return res.status(400).json({ error: 'newIGN is required' });

        const player = await PlayerPool.findById(playerId);
        if (!player) return res.status(404).json({ error: 'Player not found' });

        if (player.inGameName && player.inGameName !== newIGN) {
            player.previousIGNs = player.previousIGNs || [];
            if (!player.previousIGNs.includes(player.inGameName)) {
                player.previousIGNs.push(player.inGameName);
            }
        }

        player.inGameName = newIGN;
        await player.save();

        res.json({ message: `Updated IGN to "${newIGN}"`, player });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
