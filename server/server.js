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

const app = express();
const PORT = process.env.PORT || 3000;

// JWT Secret (ต้องตั้งใน .env)
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRES_IN = '24h';

// Admin Credentials (ต้องตั้งใน .env)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // bcrypt hash
app.use(bodyParser.json());
app.use(cors({
    origin: [
        'https://ro-v-sn-tournament-official.vercel.app', // Vercel Production
        'http://localhost:5173', // Vite Dev Server (Default)
        'http://localhost:5174', // Vite Dev Server (Fallback 1)
        'http://localhost:5175', // Vite Dev Server (Fallback 2)
        'http://localhost:3000', // Local Backend
        'https://phuriphatizamu.github.io' // Legacy
    ],
    credentials: true
}));

// --- Database Connection ---
// ใช้ Environment Variable เท่านั้น (ดูไฟล์ .env.example สำหรับตัวอย่าง)
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in environment variables!');
    console.error('📝 Please create a .env file in the server directory with your MongoDB connection string.');
    process.exit(1);
}

console.log("🔄 Connecting to MongoDB...");
mongoose.connect(MONGO_URI)
    .then(() => console.log(`✅ MongoDB Connected`))
    .catch(err => console.error('❌ MongoDB Error:', err));

// --- Schemas & Models (ประกาศหลังจาก Import mongoose แล้ว) ---

// 1. Schedule Schema
const ScheduleSchema = new mongoose.Schema({
    teams: [String],
    potA: [String],
    potB: [String],
    schedule: Array,
    createdAt: { type: Date, default: Date.now }
});
const Schedule = mongoose.model('Schedule', ScheduleSchema, 'schedules');

// 2. Result Schema
const ResultSchema = new mongoose.Schema({
    matchId: String,
    matchDay: Number,
    teamBlue: String,
    teamRed: String,
    scoreBlue: Number,
    scoreRed: Number,
    winner: String,
    loser: String,
    gameDetails: Array,
    createdAt: { type: Date, default: Date.now }
});
const Result = mongoose.model('Result', ResultSchema, 'results');

// 3. Game Stat Schema (ต้องประกาศหลังจาก mongoose ถูก import แล้วเช่นกัน)
const GameStatSchema = new mongoose.Schema({
    matchId: String,
    gameNumber: Number,
    teamName: String,
    playerName: String,
    kills: Number,
    deaths: Number,
    assists: Number,
    gold: Number,
    damage: Number,
    damageTaken: Number,
    mvp: Boolean,
    gameDuration: Number,
    win: Boolean,
    createdAt: { type: Date, default: Date.now }
});
const GameStat = mongoose.model('GameStat', GameStatSchema, 'gamestats');

// 4. Team Logo Schema (เก็บ URL โลโก้ทีม) [NEW]
const TeamLogoSchema = new mongoose.Schema({
    teamName: String,       // ชื่อทีม (Key หลักในการค้นหา)
    logoUrl: String,        // URL รูปภาพ (Cloud Storage / Public URL)
    createdAt: { type: Date, default: Date.now }
});
// บังคับชื่อ Collection ว่า 'teamlogo' ตามที่คุณระบุ
const TeamLogo = mongoose.model('TeamLogo', TeamLogoSchema, 'teamlogo');

// --- File Upload Config ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Serve static files (uploads)
app.use('/uploads', express.static(uploadDir));

// Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        // Safe filename: teamname-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Upload Endpoint



// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Upload Endpoint
app.post('/api/upload', authenticateToken, upload.single('logo'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }
    // Return the URL to access the file
    // Note: Assuming server is running on same host/port reachable by client
    // For localhost, req.protocol + '://' + req.get('host') works.
    // For production behind proxy, might need adjustment (but fine for now)
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// --- API Routes ---

app.get('/', (req, res) => {
    res.send('<h1>RoV SN Tournament API</h1><p>Status: Online</p><p>Version: 2.0 (with Auth)</p>');
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '2.0' }));

// --- AUTH ROUTES ---


// POST: Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // ตรวจสอบ username
        if (username !== ADMIN_USERNAME) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // ตรวจสอบ password
        if (!ADMIN_PASSWORD_HASH) {
            // กรณีไม่ได้ตั้ง hash ใน .env ให้ใช้ default password (สำหรับ dev เท่านั้น!)
            if (password !== 'admin123') {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        }

        // สร้าง JWT Token
        const token = jwt.sign(
            { username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Login successful',
            token,
            expiresIn: JWT_EXPIRES_IN
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET: Verify Token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// POST: Generate Password Hash (สำหรับสร้าง hash ใส่ใน .env)
app.post('/api/auth/hash', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }
        const hash = await bcrypt.hash(password, 10);
        res.json({
            message: 'Password hash generated. Add this to your .env file as ADMIN_PASSWORD_HASH',
            hash
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Schedules
app.get('/api/schedules', async (req, res) => {
    try {
        const latest = await Schedule.findOne().sort({ createdAt: -1 });
        if (!latest) return res.status(404).json({ message: "No schedule found" });
        res.json(latest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Schedules (Protected)
app.post('/api/schedules', authenticateToken, async (req, res) => {
    try {
        const newSchedule = new Schedule(req.body);
        const saved = await newSchedule.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Clear All Schedules AND Results (Protected)
app.delete('/api/schedules/clear', authenticateToken, async (req, res) => {
    try {
        const scheduleResult = await Schedule.deleteMany({});
        const resultResult = await Result.deleteMany({});
        res.json({
            message: 'All data cleared successfully',
            deleted: {
                schedules: scheduleResult.deletedCount,
                results: resultResult.deletedCount
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Results
app.get('/api/results', async (req, res) => {
    try {
        const results = await Result.find().sort({ matchDay: 1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Reset results by day (Protected)
app.delete('/api/results/reset/:day', authenticateToken, async (req, res) => {
    try {
        const { day } = req.params;
        const result = await Result.deleteMany({
            $or: [
                { matchDay: parseInt(day) },
                { matchDay: day.toString() }
            ]
        });
        res.json({ message: `Results for day ${day} cleared`, deleted: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Single Match Result (Protected)
app.delete('/api/results/:matchId', authenticateToken, async (req, res) => {
    try {
        const { matchId } = req.params;
        const result = await Result.deleteOne({ matchId });
        // Optional: delete stats too
        await GameStat.deleteMany({ matchId });
        res.json({ message: `Result ${matchId} deleted`, deleted: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Results (Protected)
app.post('/api/results', authenticateToken, async (req, res) => {
    try {
        const { matchDay, teamBlue, teamRed, scoreBlue, scoreRed } = req.body;

        let winner = null;
        let loser = null;
        if (scoreBlue > scoreRed) {
            winner = teamBlue;
            loser = teamRed;
        } else {
            winner = teamRed;
            loser = teamBlue;
        }

        const matchId = `${matchDay}_${teamBlue}_vs_${teamRed}`.replace(/\s+/g, '');

        const resultData = {
            matchId, matchDay, teamBlue, teamRed, scoreBlue, scoreRed, winner, loser
        };

        const result = await Result.findOneAndUpdate(
            { matchId: matchId },
            resultData,
            { upsert: true, new: true }
        );

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Player Stats
app.get('/api/player-stats', async (req, res) => {
    try {
        const stats = await GameStat.aggregate([
            {
                $group: {
                    _id: { playerName: "$playerName", teamName: "$teamName" },
                    totalKills: { $sum: "$kills" },
                    totalDeaths: { $sum: "$deaths" },
                    totalAssists: { $sum: "$assists" },
                    totalGold: { $sum: "$gold" },
                    totalDamage: { $sum: "$damage" },
                    totalDamageTaken: { $sum: "$damageTaken" },
                    gamesPlayed: { $sum: 1 },
                    mvpCount: { $sum: { $cond: ["$mvp", 1, 0] } }
                }
            },
            {
                $project: {
                    playerName: "$_id.playerName",
                    teamName: "$_id.teamName",
                    totalKills: 1, totalDeaths: 1, totalAssists: 1, totalGold: 1,
                    totalDamage: 1, totalDamageTaken: 1, gamesPlayed: 1, mvpCount: 1,
                    kda: {
                        $cond: [
                            { $eq: ["$totalDeaths", 0] },
                            { $add: ["$totalKills", "$totalAssists"] },
                            { $divide: [{ $add: ["$totalKills", "$totalAssists"] }, "$totalDeaths"] }
                        ]
                    },
                    gpm: { $divide: ["$totalGold", "$gamesPlayed"] }
                }
            },
            { $sort: { kda: -1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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
                    totalGold: { $sum: "$gold" },
                    gamesPlayed: { $sum: 1 },
                    wins: { $sum: { $cond: ["$win", 1, 0] } }
                }
            },
            {
                $project: {
                    teamName: "$_id",
                    totalKills: 1, totalDeaths: 1, totalAssists: 1, totalGold: 1,
                    // Assuming 5 players per team, divide by 5 to get actual team stats
                    realGamesPlayed: { $ceil: { $divide: ["$gamesPlayed", 5] } },
                    realWins: { $ceil: { $divide: ["$wins", 5] } }
                }
            },
            { $sort: { realWins: -1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Season Stats (Updated to include Total Deaths)
app.get('/api/season-stats', async (req, res) => {
    try {
        const stats = await GameStat.aggregate([
            {
                $group: {
                    _id: null,
                    totalKills: { $sum: "$kills" },
                    totalDeaths: { $sum: "$deaths" }, // เพิ่มบรรทัดนี้
                    avgGameDuration: { $avg: "$gameDuration" },
                    totalDarkSlayers: { $sum: 0 }
                }
            }
        ]);
        res.json(stats[0] || { totalKills: 0, totalDeaths: 0, avgGameDuration: 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: ดึงข้อมูลโลโก้ทั้งหมด
app.get('/api/team-logos', async (req, res) => {
    try {
        const logos = await TeamLogo.find();
        res.json(logos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: บันทึกหรืออัปเดตโลโก้ทีม (Protected)
app.post('/api/team-logos', authenticateToken, async (req, res) => {
    try {
        const { teamName, logoUrl } = req.body;

        if (!teamName || !logoUrl) {
            return res.status(400).json({ error: "teamName and logoUrl are required" });
        }

        // ใช้ upsert: true (ถ้ามีอัปเดต ถ้าไม่มีสร้างใหม่)
        const result = await TeamLogo.findOneAndUpdate(
            { teamName: teamName },
            { logoUrl: logoUrl },
            { upsert: true, new: true }
        );

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: ลบโลโก้ทีม (Protected)
app.delete('/api/team-logos/:teamName', authenticateToken, async (req, res) => {
    try {
        const { teamName } = req.params;
        const result = await TeamLogo.deleteOne({ teamName: teamName });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Logo not found' });
        }
        res.json({ message: 'Logo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Stats (Batch Insert) (Protected)
app.post('/api/stats', authenticateToken, async (req, res) => {
    try {
        const statsArray = req.body;
        if (!Array.isArray(statsArray)) {
            return res.status(400).json({ error: "Data must be an array of player stats" });
        }
        const savedStats = await GameStat.insertMany(statsArray);
        res.status(201).json(savedStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Player Pool Schema (ทะเบียนผู้เล่นสำหรับ Import/แก้ไข) [NEW]
const PlayerPoolSchema = new mongoose.Schema({
    name: String,           // ชื่อ-สกุล
    grade: String,          // ชั้น (Class)
    team: String,           // ทีม
    inGameName: String,     // ชื่อในเกม
    openId: String,         // OpenID
    createdAt: { type: Date, default: Date.now }
});
const PlayerPool = mongoose.model('PlayerPool', PlayerPoolSchema, 'playerpool');

// --- API Routes for Player Pool ---

// GET: List all players in pool
app.get('/api/players', async (req, res) => {
    try {
        const players = await PlayerPool.find().sort({ team: 1, name: 1 });
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Add single player (Protected)
app.post('/api/players', authenticateToken, async (req, res) => {
    try {
        const newPlayer = new PlayerPool(req.body);
        const saved = await newPlayer.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Batch Import Players (Protected)
app.post('/api/players/import', authenticateToken, async (req, res) => {
    try {
        const players = req.body; // Array of player objects
        if (!Array.isArray(players) || players.length === 0) {
            return res.status(400).json({ error: "Invalid data format" });
        }

        // Clear existing pool if needed? For now, append or user clears manually.
        // Or upsert based on OpenID? Let's use simple insert for speed as requested.
        const result = await PlayerPool.insertMany(players);
        res.status(201).json({ message: `Imported ${result.length} players`, count: result.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT: Update player (Protected)
app.put('/api/players/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await PlayerPool.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Delete single player (Protected)
app.delete('/api/players/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await PlayerPool.findByIdAndDelete(id);
        res.json({ message: "Player deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Clear all players (Protected)
app.delete('/api/players/all/clear', authenticateToken, async (req, res) => {
    try {
        const result = await PlayerPool.deleteMany({});
        res.json({ message: "All players cleared", deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));