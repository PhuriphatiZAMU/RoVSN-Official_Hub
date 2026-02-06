import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token = '';

    // 1. Check Authorization Header (Bearer)
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    // 2. Check Cookies if token not found (for Next.js / Browser access)
    if (!token && req.headers.cookie) {
        const cookies = req.headers.cookie.split(';');
        const authCookie = cookies.find(c => c.trim().startsWith('rov_auth_token='));
        if (authCookie) {
            token = authCookie.split('=')[1];
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Token might be expired
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};
