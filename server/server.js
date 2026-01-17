require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Google Gemini AI

const app = express();
const PORT = process.env.PORT || 3000;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRES_IN = '24h';

// Admin Credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// --- Middleware ---
app.use(compression());
app.use(bodyParser.json());
app.use(cors({
    origin: [
        'https://ro-v-sn-tournament-official.vercel.app',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
        'https://phuriphatizamu.github.io'
    ],
    credentials: true
}));

// Cache middleware
const cacheControl = (duration = 300) => (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${duration}`);
    next();
};

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in environment variables!');
    process.exit(1);
}
console.log("🔄 Connecting to MongoDB...");
mongoose.connect(MONGO_URI)
    .then(() => console.log(`✅ MongoDB Connected`))
    .catch(err => console.error('❌ MongoDB Error:', err));

// --- Schemas & Models ---
const ScheduleSchema = new mongoose.Schema({ teams: [String], potA: [String], potB: [String], schedule: Array, createdAt: { type: Date, default: Date.now } });
const Schedule = mongoose.model('Schedule', ScheduleSchema, 'schedules');

const ResultSchema = new mongoose.Schema({ matchId: String, matchDay: Number, teamBlue: String, teamRed: String, scoreBlue: Number, scoreRed: Number, winner: String, loser: String, gameDetails: Array, isByeWin: { type: Boolean, default: false }, createdAt: { type: Date, default: Date.now } });
const Result = mongoose.model('Result', ResultSchema, 'results');

const GameStatSchema = new mongoose.Schema({
    matchId: String,
    gameNumber: Number,
    teamName: String,
    playerName: String,
    heroName: String,        // ชื่อฮีโร่ที่ใช้
    kills: Number,
    deaths: Number,
    assists: Number,
    // gold: Number,            // REMOVED: ตัด Gold ออก
    mvp: Boolean,
    gameDuration: Number,    // ระยะเวลาเกม (วินาที)
    win: Boolean,
    createdAt: { type: Date, default: Date.now }
});
const GameStat = mongoose.model('GameStat', GameStatSchema, 'gamestats');

const TeamLogoSchema = new mongoose.Schema({ teamName: String, logoUrl: String, createdAt: { type: Date, default: Date.now } });
const TeamLogo = mongoose.model('TeamLogo', TeamLogoSchema, 'teamlogo');

const HeroSchema = new mongoose.Schema({ name: { type: String, required: true, unique: true }, imageUrl: String, createdAt: { type: Date, default: Date.now } });
const Hero = mongoose.model('Hero', HeroSchema, 'heroes');

const PlayerPoolSchema = new mongoose.Schema({ name: String, grade: String, team: String, inGameName: String, openId: String, createdAt: { type: Date, default: Date.now } });
const PlayerPool = mongoose.model('PlayerPool', PlayerPoolSchema, 'playerpool');

// --- Cloudinary ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'rov-heroes', allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], transformation: [{ width: 200, height: 200, crop: 'fill' }] }
});

const localUploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(localUploadDir)) fs.mkdirSync(localUploadDir);
app.use('/uploads', express.static(localUploadDir));

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, localUploadDir),
    filename: (req, file, cb) => cb(null, 'hero-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});

const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;
const upload = multer({
    storage: useCloudinary ? cloudinaryStorage : localStorage,
    limits: { fileSize: 10 * 1024 * 1024 }
});
console.log(`📁 Image Storage: ${useCloudinary ? 'Cloudinary ☁️' : 'Local Disk 💾'}`);

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// Upload Endpoint (Standard)
app.post('/api/upload', authenticateToken, upload.single('logo'), (req, res) => {
    if (!req.file) return res.status(400).send({ message: 'No file uploaded' });
    const fileUrl = (useCloudinary && req.file.path) ? req.file.path : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Configure Multer for AI (Memory Storage)
const uploadMemory = multer({ storage: multer.memoryStorage() });

// --- ROUTES ---

app.get('/', (req, res) => res.send('<h1>RoV SN Tournament API</h1><p>Status: Online</p>'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '2.0' }));

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
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
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => res.json({ valid: true, user: req.user }));

// Schedules
app.get('/api/schedules', cacheControl(120), async (req, res) => {
    try {
        const latest = await Schedule.findOne().sort({ createdAt: -1 });
        if (!latest) return res.status(404).json({ message: "No schedule found" });
        res.json(latest);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/schedules', authenticateToken, async (req, res) => {
    try {
        const newSchedule = new Schedule(req.body);
        const saved = await newSchedule.save();
        res.status(201).json(saved);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/schedules/clear', authenticateToken, async (req, res) => {
    try {
        await Schedule.deleteMany({});
        await Result.deleteMany({});
        res.json({ message: 'All data cleared successfully' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Results
app.get('/api/results', cacheControl(60), async (req, res) => {
    try {
        const results = await Result.find().sort({ matchDay: 1 });
        res.json(results);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/results', authenticateToken, async (req, res) => {
    try {
        let { matchDay, teamBlue, teamRed, scoreBlue, scoreRed, gameDetails, isByeWin } = req.body;

        // Sanitize Input (Important for consistent IDs)
        teamBlue = teamBlue.trim();
        teamRed = teamRed.trim();

        let winner = null, loser = null;
        if (scoreBlue > scoreRed) { winner = teamBlue; loser = teamRed; }
        else { winner = teamRed; loser = teamBlue; }

        const matchId = `${matchDay}_${teamBlue}_vs_${teamRed}`.replace(/\s+/g, '');
        const resultData = { matchId, matchDay, teamBlue, teamRed, scoreBlue, scoreRed, winner, loser, gameDetails: gameDetails || [], isByeWin: isByeWin || false };

        const result = await Result.findOneAndUpdate({ matchId: matchId }, resultData, { upsert: true, new: true });
        res.status(201).json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/results/:matchId', authenticateToken, async (req, res) => {
    try {
        const { matchId } = req.params;
        await Result.deleteOne({ matchId });
        await GameStat.deleteMany({ matchId });
        res.json({ message: `Result ${matchId} deleted` });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/results/reset/:day', authenticateToken, async (req, res) => {
    try {
        const { day } = req.params;
        await Result.deleteMany({ $or: [{ matchDay: parseInt(day) }, { matchDay: day.toString() }] });
        res.json({ message: `Results for day ${day} cleared` });
    } catch (error) { res.status(500).json({ error: error.message }); }
});


// Stats
app.get('/api/player-stats', async (req, res) => {
    try {
        const stats = await GameStat.aggregate([
            {
                $group: {
                    _id: { playerName: "$playerName", teamName: "$teamName" },
                    totalKills: { $sum: "$kills" },
                    totalDeaths: { $sum: "$deaths" },
                    totalAssists: { $sum: "$assists" },
                    // totalGold: { $sum: "$gold" }, // REMOVED
                    gamesPlayed: { $sum: 1 },
                    mvpCount: { $sum: { $cond: ["$mvp", 1, 0] } },
                    wins: { $sum: { $cond: ["$win", 1, 0] } },
                    // avgGPM: { $avg: "$gameGPM" } // REMOVED
                }
            },
            {
                $project: {
                    playerName: "$_id.playerName",
                    teamName: "$_id.teamName",
                    totalKills: 1, totalDeaths: 1, totalAssists: 1,
                    // totalGold: 1, // REMOVED
                    gamesPlayed: 1, mvpCount: 1, wins: 1,
                    kda: {
                        $cond: [
                            { $eq: ["$totalDeaths", 0] },
                            { $add: ["$totalKills", "$totalAssists"] },
                            { $round: [{ $divide: [{ $add: ["$totalKills", "$totalAssists"] }, "$totalDeaths"] }, 2] }
                        ]
                    },
                    // gpm: { $round: ["$avgGPM", 0] } // REMOVED
                }
            },
            { $sort: { kda: -1 } } // Sort by KDA instead of GPM
        ]);
        res.json(stats);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET: Team Stats
app.get('/api/team-stats', async (req, res) => {
    try {
        const stats = await GameStat.aggregate([
            {
                $group: {
                    _id: "$teamName",
                    totalKills: { $sum: "$kills" },
                    totalDeaths: { $sum: "$deaths" },
                    totalAssists: { $sum: "$assists" },
                    gamesPlayed: { $sum: 1 },
                    wins: { $sum: { $cond: ["$win", 1, 0] } }
                }
            },
            {
                $project: {
                    teamName: "$_id",
                    totalKills: 1, totalDeaths: 1, totalAssists: 1,
                    realGamesPlayed: { $ceil: { $divide: ["$gamesPlayed", 5] } },
                    realWins: { $ceil: { $divide: ["$wins", 5] } },
                    // Calculate Team KDA
                    kda: {
                        $cond: [
                            { $eq: ["$totalDeaths", 0] },
                            { $add: ["$totalKills", "$totalAssists"] },
                            { $divide: [{ $add: ["$totalKills", "$totalAssists"] }, "$totalDeaths"] }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    // Calculate Win Rate
                    winRate: {
                        $cond: [
                            { $eq: ["$realGamesPlayed", 0] },
                            0,
                            { $multiply: [{ $divide: ["$realWins", "$realGamesPlayed"] }, 100] }
                        ]
                    }
                }
            },
            // Sort Order: Win Rate -> Wins -> KDA -> Kills -> Name (Ascending for consistency)
            { $sort: { winRate: -1, realWins: -1, kda: -1, totalKills: -1, teamName: 1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/season-stats', async (req, res) => {
    try {
        // 1. Total Stats
        const stats = await GameStat.aggregate([{ $group: { _id: null, totalKills: { $sum: "$kills" }, totalDeaths: { $sum: "$deaths" }, avgGameDuration: { $avg: "$gameDuration" } } }]);
        let totalStats = stats[0] || { totalKills: 0, totalDeaths: 0, avgGameDuration: 0 };

        // 2. Bloodiest & Longest Game
        const results = await Result.find({ 'gameDetails.0': { $exists: true }, isByeWin: { $ne: true } });
        let highestKillGame = { match: '-', kills: 0 };
        let longestGame = { match: '-', duration: 0 };

        const gameStats = await GameStat.aggregate([{ $group: { _id: { matchId: "$matchId", gameNumber: "$gameNumber" }, totalKills: { $sum: "$kills" }, matchId: { $first: "$matchId" } } }]);
        gameStats.forEach(game => {
            if (game.totalKills > highestKillGame.kills) {
                highestKillGame = { match: game.matchId?.replace(/_/g, ' ').replace('vs', 'vs.') || 'Unknown', kills: game.totalKills };
            }
        });

        results.forEach(result => {
            if (result.gameDetails) {
                result.gameDetails.forEach(game => {
                    if (game.duration && game.duration > longestGame.duration) {
                        longestGame = { match: `${result.teamBlue} vs ${result.teamRed}`, duration: game.duration };
                    }
                });
            }
        });

        res.json({ ...totalStats, highestKillGame, longestGame });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/stats', authenticateToken, async (req, res) => {
    try {
        const statsArray = req.body;
        if (!Array.isArray(statsArray) || statsArray.length === 0) return res.status(400).json({ error: "Data must be a non-empty array" });
        const matchIds = [...new Set(statsArray.map(s => s.matchId))];
        await GameStat.deleteMany({ matchId: { $in: matchIds } });
        const savedStats = await GameStat.insertMany(statsArray);
        res.status(201).json({ message: `Saved ${savedStats.length} stats`, count: savedStats.length });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/stats/match', async (req, res) => {
    try {
        const { matchId } = req.query;
        if (!matchId) return res.status(400).json({ error: 'matchId required' });
        const stats = await GameStat.find({ matchId }).sort({ gameNumber: 1, teamName: 1 });
        res.json(stats);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Player Pool
app.get('/api/players', async (req, res) => {
    try {
        const players = await PlayerPool.find().sort({ team: 1, name: 1 });
        res.json(players);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/players/import', authenticateToken, async (req, res) => {
    try {
        const players = req.body;
        const result = await PlayerPool.insertMany(players);
        res.status(201).json({ message: `Imported ${result.length} players`, count: result.length });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/players/all/clear', authenticateToken, async (req, res) => {
    try {
        await PlayerPool.deleteMany({});
        res.json({ message: "All players cleared" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Team Logos
app.get('/api/team-logos', cacheControl(300), async (req, res) => {
    try { const logos = await TeamLogo.find(); res.json(logos); } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/team-logos', authenticateToken, async (req, res) => {
    try {
        const { teamName, logoUrl } = req.body;
        const result = await TeamLogo.findOneAndUpdate({ teamName: teamName }, { logoUrl: logoUrl }, { upsert: true, new: true });
        res.status(201).json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/team-logos/:teamName', authenticateToken, async (req, res) => {
    try { await TeamLogo.deleteOne({ teamName: req.params.teamName }); res.json({ message: 'Logo deleted' }); } catch (error) { res.status(500).json({ error: error.message }); }
});

// Heroes
app.get('/api/heroes', cacheControl(600), async (req, res) => {
    try { const heroes = await Hero.find().sort({ name: 1 }); res.json(heroes); } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/heroes/upload', authenticateToken, upload.any(), async (req, res) => {
    try {
        if (!req.files) return res.status(400).json({ error: 'No files uploaded' });
        const results = [];
        for (const file of req.files) {
            const heroName = path.basename(file.originalname, path.extname(file.originalname));
            const imageUrl = file.path || `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
            const hero = await Hero.findOneAndUpdate({ name: heroName }, { name: heroName, imageUrl: imageUrl }, { upsert: true, new: true });
            results.push(hero);
        }
        res.status(201).json({ message: `Uploaded ${results.length} heroes`, heroes: results });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/heroes/all/clear', authenticateToken, async (req, res) => {
    try { await Hero.deleteMany({}); res.json({ message: 'All heroes cleared' }); } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Endpoint (Gemini 2.5 Flash)
app.post('/api/extract-rov-stats', authenticateToken, uploadMemory.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
        if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Missing API Key' });

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype,
            },
        };

        const prompt = `
        Analyze this RoV (Arena of Valor) scoreboard screenshot.
        Extract for 10 players.
        
        CRITICAL:
        1. **Hero Name**: Look at BOTTOM-LEFT of hero portrait. Return standard hero name.
        2. **Player Name**: OCR carefully.
        3. **Stats**: K / D / A (Ignore Gold/Money).

        Return RAW JSON Array:
        [{ "name": "...", "hero": "...", "side": "blue/red", "k": 0, "d": 0, "a": 0 }]
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr);

        res.json(data);
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: `AI Error: ${error.message}` });
    }
});

// --- Serve Static Assets (Production/Deployment) ---
const clientBuildPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientBuildPath)) {
    console.log("📂 Serving static files from client/dist");
    app.use(express.static(clientBuildPath));
    // SPA Fallback: Serve index.html for any unknown route
    app.get('*', (req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
} else {
    console.log("⚠️ No client build found in client/dist. API Mode only.");
}

if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
module.exports = app;