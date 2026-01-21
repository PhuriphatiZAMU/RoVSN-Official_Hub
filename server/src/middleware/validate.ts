import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'params' | 'query';

export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const dataToValidate = target === 'body' ? req.body :
                target === 'params' ? req.params :
                    req.query;

            schema.parse(dataToValidate);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((e) => ({
                    path: e.path.map(p => String(p)).join('.'),
                    message: e.message
                }));
                return res.status(400).json({
                    error: 'Validation failed',
                    details: errors
                });
            }
            return res.status(500).json({ error: 'Internal server error during validation' });
        }
    };
};
