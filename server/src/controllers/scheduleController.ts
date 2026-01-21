import { Request, Response } from 'express';
import Schedule from '../models/Schedule';
import Result from '../models/Result';

export const getLatestSchedule = async (req: Request, res: Response) => {
    try {
        const latest = await Schedule.findOne().sort({ createdAt: -1 });
        if (!latest) return res.status(404).json({ message: "No schedule found" });
        res.json(latest);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createSchedule = async (req: Request, res: Response) => {
    try {
        const newSchedule = new Schedule(req.body);
        const saved = await newSchedule.save();
        res.status(201).json(saved);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const clearAllData = async (req: Request, res: Response) => {
    try {
        await Schedule.deleteMany({});
        await Result.deleteMany({});
        res.json({ message: 'All data cleared successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
