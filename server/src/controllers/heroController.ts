import { Request, Response } from 'express';
import Hero from '../models/Hero';
import path from 'path';

export const getHeroes = async (req: Request, res: Response) => {
    try {
        const heroes = await Hero.find().sort({ name: 1 });
        res.json(heroes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const uploadHeroes = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files)) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const results = [];
        for (const file of req.files) {
            const heroName = path.basename(file.originalname, path.extname(file.originalname));
            const imageUrl = (file as any).path || `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
            const hero = await Hero.findOneAndUpdate(
                { name: heroName },
                { name: heroName, imageUrl: imageUrl },
                { upsert: true, new: true }
            );
            results.push(hero);
        }
        res.status(201).json({ message: `Uploaded ${results.length} heroes`, heroes: results });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const clearAllHeroes = async (req: Request, res: Response) => {
    try {
        await Hero.deleteMany({});
        res.json({ message: 'All heroes cleared' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
