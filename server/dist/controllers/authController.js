"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRES_IN = '24h';
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: 'Username and password required' });
        if (username !== ADMIN_USERNAME)
            return res.status(401).json({ error: 'Invalid credentials' });
        if (!ADMIN_PASSWORD_HASH) {
            if (password !== 'admin123')
                return res.status(401).json({ error: 'Invalid credentials' });
        }
        else {
            const isValid = yield bcryptjs_1.default.compare(password, ADMIN_PASSWORD_HASH);
            if (!isValid)
                return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({ message: 'Login successful', token, expiresIn: JWT_EXPIRES_IN });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.login = login;
const verify = (req, res) => {
    res.json({ valid: true, user: req.user });
};
exports.verify = verify;
