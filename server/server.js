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

const PlayerPoolSchema = new mongoose.Schema({
    name: String,           // ชื่อจริง (ใช้ในการ aggregate สถิติ)
    grade: String,
    team: String,
    inGameName: String,     // ชื่อในเกมปัจจุบัน (IGN)
    previousIGNs: [String], // ชื่อในเกมเก่า (สำหรับ mapping สถิติเก่า)
    openId: String,
    createdAt: { type: Date, default: Date.now }
});
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


// GET: Player Stats (Enhanced)
app.get('/api/player-stats', async (req, res) => {
    try {
        const stats = await GameStat.aggregate([
            // Step 1: Lookup PlayerPool to get realName
            {
                $lookup: {
                    from: 'playerpool',
                    let: { ign: '$playerName' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$inGameName', '$$ign'] },
                                        { $eq: ['$name', '$$ign'] },
                                        { $in: ['$$ign', { $ifNull: ['$previousIGNs', []] }] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'playerInfo'
                }
            },
            // Step 2: Add realName field
            {
                $addFields: {
                    realName: {
                        $cond: [
                            { $gt: [{ $size: '$playerInfo' }, 0] },
                            { $arrayElemAt: ['$playerInfo.name', 0] },
                            '$playerName'
                        ]
                    },
                    displayName: '$playerName'
                }
            },
            // Step 3: Group by realName + teamName
            {
                $group: {
                    _id: { realName: '$realName', teamName: '$teamName' },
                    playerName: { $last: '$displayName' },
                    totalKills: { $sum: '$kills' },
                    totalDeaths: { $sum: '$deaths' },
                    totalAssists: { $sum: '$assists' },
                    gamesPlayed: { $sum: 1 },
                    mvpCount: { $sum: { $cond: ['$mvp', 1, 0] } },
                    wins: { $sum: { $cond: ['$win', 1, 0] } },
                    totalDuration: { $sum: '$gameDuration' }
                }
            },
            // Step 4: Project with enhanced stats
            {
                $project: {
                    _id: 0,
                    realName: '$_id.realName',
                    playerName: 1,
                    teamName: '$_id.teamName',
                    totalKills: 1,
                    totalDeaths: 1,
                    totalAssists: 1,
                    gamesPlayed: 1,
                    mvpCount: 1,
                    wins: 1,
                    // Win Rate %
                    winRate: {
                        $cond: [
                            { $eq: ['$gamesPlayed', 0] },
                            0,
                            { $round: [{ $multiply: [{ $divide: ['$wins', '$gamesPlayed'] }, 100] }, 1] }
                        ]
                    },
                    // Average stats per game
                    avgKillsPerGame: {
                        $cond: [
                            { $eq: ['$gamesPlayed', 0] },
                            0,
                            { $round: [{ $divide: ['$totalKills', '$gamesPlayed'] }, 1] }
                        ]
                    },
                    avgDeathsPerGame: {
                        $cond: [
                            { $eq: ['$gamesPlayed', 0] },
                            0,
                            { $round: [{ $divide: ['$totalDeaths', '$gamesPlayed'] }, 1] }
                        ]
                    },
                    avgAssistsPerGame: {
                        $cond: [
                            { $eq: ['$gamesPlayed', 0] },
                            0,
                            { $round: [{ $divide: ['$totalAssists', '$gamesPlayed'] }, 1] }
                        ]
                    },
                    // MVP Rate %
                    mvpRate: {
                        $cond: [
                            { $eq: ['$gamesPlayed', 0] },
                            0,
                            { $round: [{ $multiply: [{ $divide: ['$mvpCount', '$gamesPlayed'] }, 100] }, 1] }
                        ]
                    },
                    // KDA Ratio
                    kda: {
                        $cond: [
                            { $eq: ['$totalDeaths', 0] },
                            { $add: ['$totalKills', '$totalAssists'] },
                            { $round: [{ $divide: [{ $add: ['$totalKills', '$totalAssists'] }, '$totalDeaths'] }, 2] }
                        ]
                    }
                }
            },
            { $sort: { kda: -1, totalKills: -1, mvpCount: -1 } }
        ]);
        res.json(stats);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET: Team Stats (Enhanced)
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
                    wins: { $sum: { $cond: ["$win", 1, 0] } },
                    mvpCount: { $sum: { $cond: ["$mvp", 1, 0] } },
                    totalDuration: { $sum: "$gameDuration" }
                }
            },
            {
                $project: {
                    teamName: "$_id",
                    totalKills: 1,
                    totalDeaths: 1,
                    totalAssists: 1,
                    mvpCount: 1,
                    // Real games = player records / 5 players per team
                    realGamesPlayed: { $ceil: { $divide: ["$gamesPlayed", 5] } },
                    realWins: { $ceil: { $divide: ["$wins", 5] } },
                    // Average stats per game
                    avgKillsPerGame: {
                        $cond: [
                            { $eq: ["$gamesPlayed", 0] },
                            0,
                            { $round: [{ $divide: ["$totalKills", { $divide: ["$gamesPlayed", 5] }] }, 1] }
                        ]
                    },
                    avgDeathsPerGame: {
                        $cond: [
                            { $eq: ["$gamesPlayed", 0] },
                            0,
                            { $round: [{ $divide: ["$totalDeaths", { $divide: ["$gamesPlayed", 5] }] }, 1] }
                        ]
                    },
                    avgAssistsPerGame: {
                        $cond: [
                            { $eq: ["$gamesPlayed", 0] },
                            0,
                            { $round: [{ $divide: ["$totalAssists", { $divide: ["$gamesPlayed", 5] }] }, 1] }
                        ]
                    },
                    avgDuration: {
                        $cond: [
                            { $eq: ["$gamesPlayed", 0] },
                            0,
                            { $divide: ["$totalDuration", { $divide: ["$gamesPlayed", 5] }] }
                        ]
                    },
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
                    },
                    // Calculate Losses
                    realLosses: { $subtract: ["$realGamesPlayed", "$realWins"] }
                }
            },
            // Sort Order: Win Rate -> Wins -> KDA -> Kills -> Name
            { $sort: { winRate: -1, realWins: -1, kda: -1, totalKills: -1, teamName: 1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/season-stats', async (req, res) => {
    try {
        // 1. Total Matches & Games
        const totalMatches = await Result.countDocuments({ isByeWin: { $ne: true } });
        const allResults = await Result.find({ isByeWin: { $ne: true } });
        let totalGames = 0;
        allResults.forEach(r => {
            totalGames += (r.gameDetails?.length || 0) || (r.scoreBlue + r.scoreRed) || 0;
        });

        // 2. Avg Game Duration
        const durationStats = await GameStat.aggregate([
            { $match: { gameDuration: { $gt: 0 } } },
            { $group: { _id: { matchId: "$matchId", gameNumber: "$gameNumber" }, avgDuration: { $avg: "$gameDuration" } } },
            { $group: { _id: null, avgGameDuration: { $avg: "$avgDuration" } } }
        ]);
        const avgGameDuration = durationStats[0]?.avgGameDuration || 0;

        // 3. Bloodiest Game (most kills in a single game)
        const gameKillStats = await GameStat.aggregate([
            { $group: { _id: { matchId: "$matchId", gameNumber: "$gameNumber" }, totalKills: { $sum: "$kills" }, matchId: { $first: "$matchId" }, gameNumber: { $first: "$gameNumber" } } },
            { $sort: { totalKills: -1 } },
            { $limit: 1 }
        ]);
        const highestKillGame = gameKillStats[0]
            ? { match: gameKillStats[0].matchId?.replace(/_/g, ' ').replace('vs', 'vs.') || 'Unknown', kills: gameKillStats[0].totalKills, gameNumber: gameKillStats[0].gameNumber }
            : { match: '-', kills: 0 };

        // 4. Longest Game
        let longestGame = { match: '-', duration: 0 };
        allResults.forEach(result => {
            if (result.gameDetails) {
                result.gameDetails.forEach((game, idx) => {
                    if (game.duration && game.duration > longestGame.duration) {
                        longestGame = { match: `${result.teamBlue} vs ${result.teamRed}`, duration: game.duration, gameNumber: idx + 1 };
                    }
                });
            }
        });

        // 5. Top MVP Player (with PlayerPool lookup for real name)
        const topMVP = await GameStat.aggregate([
            { $match: { mvp: true } },
            { $lookup: { from: 'playerpool', let: { ign: '$playerName' }, pipeline: [{ $match: { $expr: { $or: [{ $eq: ['$inGameName', '$$ign'] }, { $eq: ['$name', '$$ign'] }, { $in: ['$$ign', { $ifNull: ['$previousIGNs', []] }] }] } } }], as: 'playerInfo' } },
            { $addFields: { realName: { $cond: [{ $gt: [{ $size: '$playerInfo' }, 0] }, { $arrayElemAt: ['$playerInfo.name', 0] }, '$playerName'] } } },
            { $group: { _id: '$realName', mvpCount: { $sum: 1 }, teamName: { $last: '$teamName' }, displayName: { $last: '$playerName' } } },
            { $sort: { mvpCount: -1 } },
            { $limit: 1 }
        ]);
        const topMVPPlayer = topMVP[0] ? { name: topMVP[0]._id, team: topMVP[0].teamName, count: topMVP[0].mvpCount } : null;

        // 6. Top Killer Player
        const topKiller = await GameStat.aggregate([
            { $lookup: { from: 'playerpool', let: { ign: '$playerName' }, pipeline: [{ $match: { $expr: { $or: [{ $eq: ['$inGameName', '$$ign'] }, { $eq: ['$name', '$$ign'] }, { $in: ['$$ign', { $ifNull: ['$previousIGNs', []] }] }] } } }], as: 'playerInfo' } },
            { $addFields: { realName: { $cond: [{ $gt: [{ $size: '$playerInfo' }, 0] }, { $arrayElemAt: ['$playerInfo.name', 0] }, '$playerName'] } } },
            { $group: { _id: '$realName', totalKills: { $sum: '$kills' }, teamName: { $last: '$teamName' } } },
            { $sort: { totalKills: -1 } },
            { $limit: 1 }
        ]);
        const topKillerPlayer = topKiller[0] ? { name: topKiller[0]._id, team: topKiller[0].teamName, kills: topKiller[0].totalKills } : null;

        // 7. Best Team (highest win rate with at least 2 games)
        const teamStats = await GameStat.aggregate([
            { $group: { _id: "$teamName", gamesPlayed: { $sum: 1 }, wins: { $sum: { $cond: ["$win", 1, 0] } } } },
            { $addFields: { realGames: { $ceil: { $divide: ["$gamesPlayed", 5] } }, realWins: { $ceil: { $divide: ["$wins", 5] } } } },
            { $match: { realGames: { $gte: 2 } } },
            { $addFields: { winRate: { $cond: [{ $eq: ["$realGames", 0] }, 0, { $multiply: [{ $divide: ["$realWins", "$realGames"] }, 100] }] } } },
            { $sort: { winRate: -1, realWins: -1 } },
            { $limit: 1 }
        ]);
        const bestTeam = teamStats[0] ? { name: teamStats[0]._id, winRate: teamStats[0].winRate?.toFixed(1), wins: teamStats[0].realWins, games: teamStats[0].realGames } : null;

        // 8. Most Picked Hero
        const heroStats = await GameStat.aggregate([
            { $group: { _id: "$heroName", pickCount: { $sum: 1 }, wins: { $sum: { $cond: ["$win", 1, 0] } } } },
            { $addFields: { winRate: { $cond: [{ $eq: ["$pickCount", 0] }, 0, { $multiply: [{ $divide: ["$wins", "$pickCount"] }, 100] }] } } },
            { $sort: { pickCount: -1 } },
            { $limit: 1 }
        ]);
        const mostPickedHero = heroStats[0] ? { name: heroStats[0]._id, picks: heroStats[0].pickCount, winRate: heroStats[0].winRate?.toFixed(1) } : null;

        // 9. Highest Win Rate Hero (min 5 picks)
        const heroWinRateStats = await GameStat.aggregate([
            { $group: { _id: "$heroName", pickCount: { $sum: 1 }, wins: { $sum: { $cond: ["$win", 1, 0] } } } },
            { $match: { pickCount: { $gte: 5 } } },
            { $addFields: { winRate: { $cond: [{ $eq: ["$pickCount", 0] }, 0, { $multiply: [{ $divide: ["$wins", "$pickCount"] }, 100] }] } } },
            { $sort: { winRate: -1, pickCount: -1 } },
            { $limit: 1 }
        ]);
        const bestWinRateHero = heroWinRateStats[0] ? { name: heroWinRateStats[0]._id, picks: heroWinRateStats[0].pickCount, winRate: heroWinRateStats[0].winRate?.toFixed(1) } : null;

        res.json({
            totalMatches,
            totalGames,
            avgGameDuration,
            highestKillGame,
            longestGame,
            topMVPPlayer,
            topKillerPlayer,
            bestTeam,
            mostPickedHero,
            bestWinRateHero
        });
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

// Get unmatched IGNs (IGNs in stats that don't match any player in PlayerPool)
app.get('/api/players/unmatched-igns', authenticateToken, async (req, res) => {
    try {
        // Get all unique playerNames from GameStat
        const statsIGNs = await GameStat.distinct('playerName');

        // Get all players from PlayerPool
        const players = await PlayerPool.find({});

        // Build a set of all known IGNs (current + previous)
        const knownIGNs = new Set();
        players.forEach(p => {
            if (p.name) knownIGNs.add(p.name);
            if (p.inGameName) knownIGNs.add(p.inGameName);
            (p.previousIGNs || []).forEach(ign => knownIGNs.add(ign));
        });

        // Find IGNs that are not in knownIGNs
        const unmatchedIGNs = statsIGNs.filter(ign => !knownIGNs.has(ign));

        // Get stats count for each unmatched IGN
        const result = await Promise.all(unmatchedIGNs.map(async (ign) => {
            const count = await GameStat.countDocuments({ playerName: ign });
            const sample = await GameStat.findOne({ playerName: ign });
            return { ign, gamesCount: count, team: sample?.teamName || 'Unknown' };
        }));

        res.json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Add a previous IGN to a player (for merging stats)
app.post('/api/players/:playerId/add-previous-ign', authenticateToken, async (req, res) => {
    try {
        const { playerId } = req.params;
        const { previousIGN } = req.body;

        if (!previousIGN) return res.status(400).json({ error: 'previousIGN is required' });

        const player = await PlayerPool.findByIdAndUpdate(
            playerId,
            { $addToSet: { previousIGNs: previousIGN } },
            { new: true }
        );

        if (!player) return res.status(404).json({ error: 'Player not found' });

        res.json({ message: `Added "${previousIGN}" to ${player.name}'s previous IGNs`, player });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Update player's current IGN (auto-archive old one to previousIGNs)
app.patch('/api/players/:playerId/update-ign', authenticateToken, async (req, res) => {
    try {
        const { playerId } = req.params;
        const { newIGN } = req.body;

        if (!newIGN) return res.status(400).json({ error: 'newIGN is required' });

        const player = await PlayerPool.findById(playerId);
        if (!player) return res.status(404).json({ error: 'Player not found' });

        // Archive current IGN to previousIGNs before updating
        if (player.inGameName && player.inGameName !== newIGN) {
            player.previousIGNs = player.previousIGNs || [];
            if (!player.previousIGNs.includes(player.inGameName)) {
                player.previousIGNs.push(player.inGameName);
            }
        }

        player.inGameName = newIGN;
        await player.save();

        res.json({ message: `Updated IGN to "${newIGN}"`, player });
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

// Player Hero Stats - Top heroes used by each player (grouped by realName)
app.get('/api/player-hero-stats', async (req, res) => {
    try {
        const stats = await GameStat.aggregate([
            // Step 1: Lookup PlayerPool to get realName
            {
                $lookup: {
                    from: 'playerpool',
                    let: { ign: '$playerName' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$inGameName', '$$ign'] },
                                        { $eq: ['$name', '$$ign'] },
                                        { $in: ['$$ign', { $ifNull: ['$previousIGNs', []] }] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'playerInfo'
                }
            },
            // Step 2: Add realName field
            {
                $addFields: {
                    realName: {
                        $cond: [
                            { $gt: [{ $size: '$playerInfo' }, 0] },
                            { $arrayElemAt: ['$playerInfo.name', 0] },
                            '$playerName'
                        ]
                    },
                    displayName: '$playerName'
                }
            },
            // Step 3: Group by realName + hero to count usage
            {
                $group: {
                    _id: { realName: '$realName', heroName: '$heroName' },
                    playerName: { $last: '$displayName' },
                    gamesPlayed: { $sum: 1 },
                    wins: { $sum: { $cond: ['$win', 1, 0] } },
                    totalKills: { $sum: '$kills' },
                    totalDeaths: { $sum: '$deaths' },
                    totalAssists: { $sum: '$assists' }
                }
            },
            // Sort by games played for each player-hero combo
            { $sort: { gamesPlayed: -1 } },
            // Group by realName to collect all their heroes
            {
                $group: {
                    _id: '$_id.realName',
                    playerName: { $first: '$playerName' },
                    heroes: {
                        $push: {
                            heroName: '$_id.heroName',
                            gamesPlayed: '$gamesPlayed',
                            wins: '$wins',
                            totalKills: '$totalKills',
                            totalDeaths: '$totalDeaths',
                            totalAssists: '$totalAssists'
                        }
                    }
                }
            },
            // Format output
            {
                $project: {
                    _id: 0,
                    realName: '$_id',
                    playerName: 1,
                    topHeroes: { $slice: ['$heroes', 3] }
                }
            }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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

// Standings API - Calculate standings directly from database
app.get('/api/standings', cacheControl(60), async (req, res) => {
    try {
        // Use MongoDB Aggregation to calculate standings directly from results
        const standings = await Result.aggregate([
            // Step 1: Filter out knockout stages (matchDay >= 90)
            {
                $match: {
                    $expr: {
                        $lt: [{ $toInt: { $ifNull: ['$matchDay', 0] } }, 90]
                    }
                }
            },
            // Step 2: Create two records per result (one for each team)
            {
                $facet: {
                    // Blue team perspective
                    blueTeam: [
                        {
                            $project: {
                                teamName: '$teamBlue',
                                opponent: '$teamRed',
                                scoreFor: '$scoreBlue',
                                scoreAgainst: '$scoreRed',
                                isByeWin: { $ifNull: ['$isByeWin', false] },
                                winner: '$winner',
                                loser: '$loser'
                            }
                        }
                    ],
                    // Red team perspective
                    redTeam: [
                        {
                            $project: {
                                teamName: '$teamRed',
                                opponent: '$teamBlue',
                                scoreFor: '$scoreRed',
                                scoreAgainst: '$scoreBlue',
                                isByeWin: { $ifNull: ['$isByeWin', false] },
                                winner: '$winner',
                                loser: '$loser'
                            }
                        }
                    ]
                }
            },
            // Step 3: Combine both perspectives
            {
                $project: {
                    allTeamRecords: { $concatArrays: ['$blueTeam', '$redTeam'] }
                }
            },
            { $unwind: '$allTeamRecords' },
            { $replaceRoot: { newRoot: '$allTeamRecords' } },
            // Step 4: Calculate stats per team
            {
                $group: {
                    _id: '$teamName',
                    // Total matches played
                    p: { $sum: 1 },
                    // Wins (when team is winner)
                    w: {
                        $sum: {
                            $cond: [{ $eq: ['$teamName', '$winner'] }, 1, 0]
                        }
                    },
                    // Losses (when team is loser)
                    l: {
                        $sum: {
                            $cond: [{ $eq: ['$teamName', '$loser'] }, 1, 0]
                        }
                    },
                    // Game Difference (only for non-bye matches)
                    gd: {
                        $sum: {
                            $cond: [
                                '$isByeWin',
                                0, // Bye wins don't count for GD
                                { $subtract: ['$scoreFor', '$scoreAgainst'] }
                            ]
                        }
                    },
                    // Points (3 for win)
                    pts: {
                        $sum: {
                            $cond: [{ $eq: ['$teamName', '$winner'] }, 3, 0]
                        }
                    }
                }
            },
            // Step 5: Sort by Points > GD > Name
            {
                $sort: {
                    pts: -1,
                    gd: -1,
                    _id: 1
                }
            },
            // Step 6: Format output
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    p: 1,
                    w: 1,
                    l: 1,
                    gd: 1,
                    pts: 1
                }
            }
        ]);

        res.json(standings);
    } catch (error) {
        console.error('Standings calculation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Serve Static Assets (Production/Deployment) ---
const clientBuildPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientBuildPath)) {
    console.log("📂 Serving static files from client/dist");
    app.use(express.static(clientBuildPath));
    // SPA Fallback: Serve index.html for any unknown route (except /api/*)
    app.get('*', (req, res, next) => {
        // Don't catch API routes - let them 404 properly
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
} else {
    console.log("⚠️ No client build found in client/dist. API Mode only.");
}

if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
module.exports = app;