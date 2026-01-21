"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheControl = void 0;
const cacheControl = (duration = 300) => (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${duration}`);
    next();
};
exports.cacheControl = cacheControl;
