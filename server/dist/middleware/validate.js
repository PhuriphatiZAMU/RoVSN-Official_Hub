"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema, target = 'body') => {
    return (req, res, next) => {
        try {
            const dataToValidate = target === 'body' ? req.body :
                target === 'params' ? req.params :
                    req.query;
            schema.parse(dataToValidate);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
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
exports.validate = validate;
