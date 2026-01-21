import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AuthRequest } from '../middleware/auth';

dotenv.config();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRES_IN = '24h';

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
        if (username !== ADMIN_USERNAME) return res.status(401).json({ error: 'Invalid credentials' });

        if (!ADMIN_PASSWORD_HASH) {
            if (password !== 'admin123') return res.status(401).json({ error: 'Invalid credentials' });
        } else {
            const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
            if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({ message: 'Login successful', token, expiresIn: JWT_EXPIRES_IN });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const verify = (req: AuthRequest, res: Response) => {
    res.json({ valid: true, user: req.user });
};
