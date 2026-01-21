import { Request, Response, NextFunction } from 'express';

export const cacheControl = (duration: number = 300) => (req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', `public, max-age=${duration}`);
    next();
};
