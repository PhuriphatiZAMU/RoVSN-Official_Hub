require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
        'http://localhost:5173', // Vite Dev Server
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

// --- API Routes ---

app.get('/', (req, res) => {
    res.send('<h1>RoV SN Tournament API</h1><p>Status: Online</p><p>Version: 2.0 (with Auth)</p>');
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '2.0' }));

// --- AUTH ROUTES ---

// Utility Endpoint: สร้าง Password Hash (ใช้สำหรับ Setup เท่านั้น ควรปิดเมื่อใช้งานจริง)
app.post('/api/auth/hash-generator', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ error: 'Password required' });

        const hash = await bcrypt.hash(password, 10);
        res.json({ password, hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`Login attempt for username: '${username}'`); // LOG 1

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // ตรวจสอบ username
        if (username !== ADMIN_USERNAME) {
            console.log(`Login failed: Username mismatch. Expected '${ADMIN_USERNAME}', got '${username}'`); // LOG 2
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // ตรวจสอบ password
        if (!ADMIN_PASSWORD_HASH) {
            console.log("Login warning: No ADMIN_PASSWORD_HASH set, using default 'admin123'");
            if (password !== 'admin123') {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            console.log("Verifying password against hash...");

            // --- DEBUG SECTION START ---
            console.log(`Debug: Received password length: ${password.length}`);
            console.log(`Debug: Is password exactly 'Lastfreedom4_'? ${password === 'Lastfreedom4_'}`);
            console.log(`Debug: Hash loaded from Env starts with: ${ADMIN_PASSWORD_HASH.substring(0, 10)}...`);
            // --- DEBUG SECTION END ---

            const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
            if (!isValid) {
                console.log("Login failed: Password incorrect (Hash mismatch)");
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        }

        console.log("Login successful!"); // LOG 6
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

// GET: Results
app.get('/api/results', async (req, res) => {
    try {
        const results = await Result.find().sort({ matchDay: 1 });
        res.json(results);
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
                    gamesPlayed: { $sum: 1 },
                    mvpCount: { $sum: { $cond: ["$mvp", 1, 0] } }
                }
            },
            {
                $project: {
                    playerName: "$_id.playerName",
                    teamName: "$_id.teamName",
                    totalKills: 1, totalDeaths: 1, totalAssists: 1, totalGold: 1, gamesPlayed: 1, mvpCount: 1,
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

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));