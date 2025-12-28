require('dotenv').config();
// 3. Game Stat Schema (เก็บสถิติละเอียดรายเกม) [NEW]
// ใช้เก็บข้อมูลหลังจบแต่ละเกมย่อยใน BO3
const GameStatSchema = new mongoose.Schema({
    matchId: String,        // อ้างอิง Match ID เช่น "1_Buriram_vs_Talon"
    gameNumber: Number,     // เกมที่เท่าไหร่ (1, 2, 3)
    teamName: String,       // ชื่อทีม
    playerName: String,     // ชื่อผู้เล่น
    kills: Number,
    deaths: Number,
    assists: Number,
    gold: Number,
    damage: Number,         // ดาเมจที่ทำได้
    damageTaken: Number,    // ดาเมจที่รับ
    mvp: Boolean,           // เป็น MVP หรือไม่
    gameDuration: Number,   // ระยะเวลาเกม (วินาที)
    win: Boolean,           // ชนะหรือไม่
    createdAt: { type: Date, default: Date.now }
});
const GameStat = mongoose.model('GameStat', GameStatSchema, 'gamestats');

const mongoose = require('mongoose');
// --- STATS API [NEW] ---

// GET: ดึงสถิติผู้เล่นรวม (Aggregated Player Stats)
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
                    gpm: { $divide: ["$totalGold", "$gamesPlayed"] } // Simplified GPM (avg gold per game)
                }
            },
            { $sort: { kda: -1 } } // เรียงตาม KDA มากไปน้อย
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: ดึงสถิติทีมรวม (Aggregated Team Stats)
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
                    gamesPlayed: { $sum: 1 }, // Note: This counts player-games, need to divide by 5 for actual team games if storing per player
                    wins: { $sum: { $cond: ["$win", 1, 0] } }
                }
            },
            {
                $project: {
                    teamName: "$_id",
                    totalKills: 1, totalDeaths: 1, totalAssists: 1, totalGold: 1,
                    // สมมติว่าเก็บข้อมูลรายผู้เล่น หาร 5 เพื่อหาจำนวนเกมจริง (ถ้าเก็บรายทีมไม่ต้องหาร)
                    // ในที่นี้สมมติเก็บรายผู้เล่น
                    realGamesPlayed: { $divide: ["$gamesPlayed", 5] }, 
                    realWins: { $divide: ["$wins", 5] }
                }
            },
            { $sort: { realWins: -1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: ดึงสถิติรวมของทัวร์นาเมนต์ (Season Stats)
app.get('/api/season-stats', async (req, res) => {
    try {
        const stats = await GameStat.aggregate([
            {
                $group: {
                    _id: null,
                    totalKills: { $sum: "$kills" },
                    avgGameDuration: { $avg: "$gameDuration" },
                    totalDarkSlayers: { $sum: 0 } // Mock field (ต้องเพิ่ม field ใน schema ถ้าจะเก็บจริง)
                }
            }
        ]);
        res.json(stats[0] || { totalKills: 0, avgGameDuration: 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: บันทึกสถิติเกม (Batch Insert for a whole game)
app.post('/api/stats', async (req, res) => {
    try {
        const statsArray = req.body; // รับเป็น Array ของผู้เล่นทุกคนในเกมนั้น
        if (!Array.isArray(statsArray)) {
            return res.status(400).json({ error: "Data must be an array of player stats" });
        }

        const savedStats = await GameStat.insertMany(statsArray);
        console.log(`✅ Saved ${savedStats.length} player stats records.`);
        res.status(201).json(savedStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Schedules (For Admin/Draft)
app.post('/api/schedules', async (req, res) => {
    try {
        const newSchedule = new Schedule(req.body);
        const saved = await newSchedule.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RESULTS API [NEW] ---

// GET: ดึงผลการแข่งขันทั้งหมด
app.get('/api/results', async (req, res) => {
    try {
        const results = await Result.find().sort({ matchDay: 1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: บันทึกผลการแข่งขัน (Update Match Day immediately logic)
app.post('/api/results', async (req, res) => {
    try {
        const { matchDay, teamBlue, teamRed, scoreBlue, scoreRed } = req.body;

        // 1. Validation Logic for BO3
        if (scoreBlue < 0 || scoreRed < 0 || (scoreBlue + scoreRed > 3)) {
            return res.status(400).json({ error: "Invalid BO3 Score" });
        }
        
        // 2. Determine Winner
        let winner = null;
        let loser = null;
        if (scoreBlue > scoreRed) {
            winner = teamBlue;
            loser = teamRed;
        } else {
            winner = teamRed;
            loser = teamBlue;
        }

        // 3. Create Unique Match ID
        const matchId = `${matchDay}_${teamBlue}_vs_${teamRed}`.replace(/\s+/g, '');

        // 4. Save/Update Result (Upsert)
        const resultData = {
            matchId, matchDay, teamBlue, teamRed, scoreBlue, scoreRed, winner, loser
        };

        const result = await Result.findOneAndUpdate(
            { matchId: matchId }, 
            resultData, 
            { upsert: true, new: true } // ถ้ามีแล้วอัปเดต ถ้าไม่มีให้สร้างใหม่
        );

        console.log(`✅ Match Result Saved: ${teamBlue} ${scoreBlue} - ${scoreRed} ${teamRed}`);
        res.status(201).json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));