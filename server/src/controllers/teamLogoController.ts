import { Request, Response } from 'express';
import TeamLogo from '../models/TeamLogo';

export const getTeamLogos = async (req: Request, res: Response) => {
    try {
        const logos = await TeamLogo.find();
        res.json(logos);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const saveTeamLogo = async (req: Request, res: Response) => {
    try {
        const { teamName, logoUrl } = req.body;
        const result = await TeamLogo.findOneAndUpdate(
            { teamName: teamName },
            { logoUrl: logoUrl },
            { upsert: true, new: true }
        );
        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTeamLogo = async (req: Request, res: Response) => {
    try {
        await TeamLogo.deleteOne({ teamName: req.params.teamName });
        res.json({ message: 'Logo deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
