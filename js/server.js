const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration - Allow GitHub Pages and localhost
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://phuriphatizamu.github.io',
        'https://rov-sn-tournament-api.vercel.app'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
let db;
let schedulesCollection;
let tableCollection;
let playersCollection;
let scheduleResultsCollection;
let fixturesCollection;
let playerStatsCollection;

const connectDB = async () => {
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas');
        
        db = client.db('rov_sn_tournament_2026');
        schedulesCollection = db.collection('schedules');
        tableCollection = db.collection('table');
        playersCollection = db.collection('players');
        scheduleResultsCollection = db.collection('schedule_results');
        fixturesCollection = db.collection('fixtures');
        playerStatsCollection = db.collection('player_stats');
        
        console.log('📦 Database:', db.databaseName);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

// Routes

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json( {
        status: 'ok',
        message: 'Server is running',
        database: db ? 'connected' : 'disconnected'
    });
});

// ==================== FIXTURES & RESULTS ====================

// Get All Fixtures
app.get('/api/fixtures', async (req, res) => {
    try {
        const fixtures = await fixturesCollection
            .find({})
            .sort({ matchDay: 1, matchNo: 1 })
            .toArray();
        
        res.status(200).json(fixtures);
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        res.status(500).json({ error: 'Failed to fetch fixtures' });
    }
});

// Get Fixtures by Day
app.get('/api/fixtures/day/:day', async (req, res) => {
    try {
        const day = parseInt(req.params.day);
        const fixtures = await fixturesCollection
            .find({ matchDay: day })
            .sort({ matchNo: 1 })
            .toArray();
        
        res.status(200).json(fixtures);
    } catch (error) {
        console.error('Error fetching fixtures by day:', error);
        res.status(500).json({ error: 'Failed to fetch fixtures' });
    }
});

// Get Completed Fixtures Only (สำหรับ schedule.html)
app.get('/api/fixtures/completed', async (req, res) => {
    try {
        const fixtures = await fixturesCollection
            .find({ status: 'จบการแข่งขัน' })
            .sort({ matchDay: 1, matchNo: 1 })
            .toArray();
        
        // Group by day
        const groupedByDay = {};
        fixtures.forEach(f => {
            if (!groupedByDay[f.matchDay]) {
                groupedByDay[f.matchDay] = [];
            }
            groupedByDay[f.matchDay].push(f);
        });
        
        res.status(200).json( {
            total: fixtures.length,
            byDay: groupedByDay,
            fixtures: fixtures
        });
    } catch (error) {
        console.error('Error fetching completed fixtures:', error);
        res.status(500).json({ error: 'Failed to fetch fixtures' });
    }
});

// Add Single Fixture
app.post('/api/fixtures', async (req, res) => {
    try {
        const { matchDay, matchNo } = req.body;
        
        if (!matchDay || !matchNo) {
            return res.status(400).json({ error: 'Please provide matchDay and matchNo' });
        }
        
        const fixtureData = {
            ...req.body,
            createdAt: new Date()
        };
        
        const result = await fixturesCollection.insertOne(fixtureData);
        
        res.status(201).json( {
            message: 'Fixture created successfully',
            id: result.insertedId
        });
    } catch (error) {
        console.error('Error creating fixture:', error);
        res.status(500).json({ error: 'Failed to create fixture' });
    }
});

// Update Fixture Score (by matchDay and matchNo)
app.patch('/api/fixtures/:matchDay/:matchNo', async (req, res) => {
    try {
        const matchDay = parseInt(req.params.matchDay);
        const matchNo = parseInt(req.params.matchNo);
        const { score1, score2, status } = req.body;
        
        const updateData = {
            updatedAt: new Date()
        };
        
        if (score1 !== undefined) updateData.score1 = parseInt(score1);
        if (score2 !== undefined) updateData.score2 = parseInt(score2);
        if (status) updateData.status = status;
        
        const result = await fixturesCollection.updateOne(
            { matchDay: matchDay, matchNo: matchNo },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Fixture not found' });
        }
        
        res.status(200).json( {
            message: 'Fixture updated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error updating fixture:', error);
        res.status(500).json({ error: 'Failed to update fixture' });
    }
});

// Bulk Add Fixtures (for seeding)
app.post('/api/fixtures/bulk', async (req, res) => {
    try {
        const { fixtures } = req.body;
        
        if (!fixtures || !Array.isArray(fixtures)) {
            return res.status(400).json({ error: 'Please provide fixtures array' });
        }
        
        // Validate matchDay and matchNo
        const invalidFixtures = fixtures.filter(f => !f.matchDay || !f.matchNo);
        if (invalidFixtures.length > 0) {
            return res.status(400).json( {
                error: 'All fixtures must have matchDay and matchNo',
                invalidCount: invalidFixtures.length
            });
        }
        
        const fixturesWithTimestamp = fixtures.map(f => ({
            ...f,
            createdAt: new Date()
        }));
        
        const result = await fixturesCollection.insertMany(fixturesWithTimestamp);
        
        res.status(201).json( {
            message: 'Fixtures created successfully',
            insertedCount: result.insertedCount
        });
    } catch (error) {
        console.error('Error creating fixtures:', error);
        res.status(500).json({ error: 'Failed to create fixtures' });
    }
});

// ==================== SCHEDULES ====================

// Get All Schedules (Sorted by latest)
app.get('/api/schedules', async (req, res) => {
    try {
        const schedules = await schedulesCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        
        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

// Get Latest Schedule
app.get('/api/schedules/latest', async (req, res) => {
    try {
        const latestSchedule = await schedulesCollection
            .findOne({}, { sort: { createdAt: -1 } });
        
        if (!latestSchedule) {
            return res.status(404).json({ error: 'No schedule found' });
        }
        
        res.status(200).json(latestSchedule);
    } catch (error) {
        console.error('Error fetching latest schedule:', error);
        res.status(500).json({ error: 'Failed to fetch latest schedule' });
    }
});

// Create New Schedule (For Draft System)
app.post('/api/schedules', async (req, res) => {
    try {
        const scheduleData = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await schedulesCollection.insertOne(scheduleData);
        
        res.status(201).json( {
            message: 'Schedule created successfully',
            id: result.insertedId,
            data: scheduleData
        });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});

// Update Schedule by ID
app.put('/api/schedules/:id', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const scheduleId = new ObjectId(req.params.id);
        
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };
        
        const result = await schedulesCollection.updateOne(
            { _id: scheduleId },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        
        res.status(200).json( {
            message: 'Schedule updated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ error: 'Failed to update schedule' });
    }
});

// Update Match Score
app.patch('/api/schedules/:id/match-score', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const scheduleId = new ObjectId(req.params.id);
        const { dayIndex, matchIndex, team1Score, team2Score } = req.body;
        
        if (dayIndex === undefined || matchIndex === undefined || team1Score === undefined || team2Score === undefined) {
            return res.status(400).json({ error: 'Missing required fields: dayIndex, matchIndex, team1Score, team2Score' });
        }
        
        const updatePath = `schedule.${dayIndex}.matches.${matchIndex}`;
        
        const result = await schedulesCollection.updateOne(
            { _id: scheduleId },
            {
                $set: {
                    [`${updatePath}.team1Score`]: parseInt(team1Score),
                    [`${updatePath}.team2Score`]: parseInt(team2Score),
                    [`${updatePath}.status`]: 'completed',
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        
        res.status(200).json( {
            message: 'Match score updated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error updating match score:', error);
        res.status(500).json({ error: 'Failed to update match score' });
    }
});

// Reset Match Score
app.patch('/api/schedules/:id/reset-match', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const scheduleId = new ObjectId(req.params.id);
        const { dayIndex, matchIndex } = req.body;
        
        if (dayIndex === undefined || matchIndex === undefined) {
            return res.status(400).json({ error: 'Missing required fields: dayIndex, matchIndex' });
        }
        
        const updatePath = `schedule.${dayIndex}.matches.${matchIndex}`;
        
        const result = await schedulesCollection.updateOne(
            { _id: scheduleId },
            {
                $unset: {
                    [`${updatePath}.team1Score`]: '',
                    [`${updatePath}.team2Score`]: '',
                    [`${updatePath}.status`]: ''
                },
                $set: {
                    updatedAt: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        
        res.status(200).json( {
            message: 'Match score reset successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error resetting match score:', error);
        res.status(500).json({ error: 'Failed to reset match score' });
    }
});

// Reset All Day Scores
app.patch('/api/schedules/:id/reset-day', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const scheduleId = new ObjectId(req.params.id);
        const { dayIndex } = req.body;
        
        if (dayIndex === undefined) {
            return res.status(400).json({ error: 'Missing required field: dayIndex' });
        }
        
        // Get schedule to know how many matches in the day
        const schedule = await schedulesCollection.findOne({ _id: scheduleId });
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        
        const matchesCount = schedule.schedule[dayIndex].matches.length;
        const unsetFields = {};
        
        for (let i = 0; i < matchesCount; i++) {
            unsetFields[`schedule.${dayIndex}.matches.${i}.team1Score`] = '';
            unsetFields[`schedule.${dayIndex}.matches.${i}.team2Score`] = '';
            unsetFields[`schedule.${dayIndex}.matches.${i}.status`] = '';
        }
        
        const result = await schedulesCollection.updateOne(
            { _id: scheduleId },
            {
                $unset: unsetFields,
                $set: { updatedAt: new Date() }
            }
        );
        
        res.status(200).json( {
            message: `Reset ${matchesCount} matches successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error resetting day scores:', error);
        res.status(500).json({ error: 'Failed to reset day scores' });
    }
});

// ==================== SCHEDULE RESULTS ROUTES ====================

// Get All Schedule Results
app.get('/api/schedule-results', async (req, res) => {
    try {
        const results = await scheduleResultsCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching schedule results:', error);
        res.status(500).json({ error: 'Failed to fetch schedule results' });
    }
});

// Get Latest Schedule Results
app.get('/api/schedule-results/latest', async (req, res) => {
    try {
        const latestResult = await scheduleResultsCollection
            .findOne({}, { sort: { createdAt: -1 } });
        
        if (!latestResult) {
            return res.status(200).json({ results: [] });
        }
        
        res.status(200).json(latestResult);
    } catch (error) {
        console.error('Error fetching latest schedule results:', error);
        res.status(500).json({ error: 'Failed to fetch latest schedule results' });
    }
});

// Update or Create Match Result
app.post('/api/schedule-results/match', async (req, res) => {
    try {
        const { dayIndex, matchIndex, team1, team2, team1Score, team2Score } = req.body;
        
        if (dayIndex === undefined || matchIndex === undefined || !team1 || !team2 || 
            team1Score === undefined || team2Score === undefined) {
            return res.status(400).json( {
                error: 'Missing required fields: dayIndex, matchIndex, team1, team2, team1Score, team2Score' 
            });
        }
        
        // Find or create latest schedule results document
        let results = await scheduleResultsCollection.findOne({}, { sort: { createdAt: -1 } });
        
        if (!results) {
            // Create new document with 8 days, 4 matches each
            results = {
                results: Array(8).fill(null).map((_, dayIdx) => ({
                    day: dayIdx + 1,
                    matches: Array(4).fill(null).map(() => ({}))
                })),
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
        
        // Update specific match
        results.results[dayIndex].matches[matchIndex] = {
            team1,
            team2,
            team1Score: parseInt(team1Score),
            team2Score: parseInt(team2Score),
            status: 'completed',
            updatedAt: new Date()
        };
        results.updatedAt = new Date();
        
        // Upsert
        const result = await scheduleResultsCollection.updateOne(
            { _id: results._id || new (require('mongodb')).ObjectId() },
            { $set: results },
            { upsert: true }
        );
        
        res.status(200).json( {
            message: 'Match result updated successfully',
            data: results.results[dayIndex].matches[matchIndex]
        });
    } catch (error) {
        console.error('Error updating match result:', error);
        res.status(500).json({ error: 'Failed to update match result' });
    }
});

// Delete Match Result
app.delete('/api/schedule-results/match', async (req, res) => {
    try {
        const { dayIndex, matchIndex } = req.body;
        
        if (dayIndex === undefined || matchIndex === undefined) {
            return res.status(400).json({ error: 'Missing required fields: dayIndex, matchIndex' });
        }
        
        const results = await scheduleResultsCollection.findOne({}, { sort: { createdAt: -1 } });
        
        if (!results) {
            return res.status(404).json({ error: 'No schedule results found' });
        }
        
        // Clear specific match
        results.results[dayIndex].matches[matchIndex] = {};
        results.updatedAt = new Date();
        
        await scheduleResultsCollection.updateOne(
            { _id: results._id },
            { $set: results }
        );
        
        res.status(200).json({ message: 'Match result deleted successfully' });
    } catch (error) {
        console.error('Error deleting match result:', error);
        res.status(500).json({ error: 'Failed to delete match result' });
    }
});

// Delete Schedule by ID
app.delete('/api/schedules/:id', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const scheduleId = new ObjectId(req.params.id);
        
        const result = await schedulesCollection.deleteOne({ _id: scheduleId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        
        res.status(200).json( {
            message: 'Schedule deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});

// ==================== STANDINGS ROUTES (TABLE) ====================

// Shared helpers for table/standings routes
const getAllTable = async () => tableCollection.find({}).sort({ createdAt: -1 }).toArray();

const getLatestStandingsPayload = async () => {
    const docs = await tableCollection.find({}).sort({ createdAt: -1, _id: -1 }).toArray();
    if (!docs || docs.length === 0) return { standings: [] };

    const first = docs[0];
    if (Array.isArray(first.standings)) return first;

    const standingsArray = docs
        .map(doc => ({ ...doc, _id: undefined }))
        .sort((a, b) => {
            if (a.rank !== undefined && b.rank !== undefined) return a.rank - b.rank;
            return (b.points || 0) - (a.points || 0);
        });

    return { standings: standingsArray };
};

const handleListTable = async (req, res) => {
    try {
        const table = await getAllTable();
        res.status(200).json(table);
    } catch (error) {
        console.error('Error fetching table:', error);
        res.status(500).json({ error: 'Failed to fetch table' });
    }
};

const handleLatestTable = async (req, res) => {
    try {
        const payload = await getLatestStandingsPayload();
        res.status(200).json(payload);
    } catch (error) {
        console.error('Error fetching latest table:', error);
        res.status(500).json({ error: 'Failed to fetch latest table' });
    }
};

const handleCreateTable = async (req, res) => {
    try {
        const standingsData = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await tableCollection.insertOne(standingsData);

        res.status(201).json( {
            message: 'Table created successfully',
            id: result.insertedId,
            data: standingsData
        });
    } catch (error) {
        console.error('Error creating table:', error);
        res.status(500).json({ error: 'Failed to create table' });
    }
};

const handleUpdateTable = async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const tableId = new ObjectId(req.params.id);

        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const result = await tableCollection.updateOne(
            { _id: tableId },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Standings not found' });
        }

        res.status(200).json( {
            message: 'Standings updated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error updating standings:', error);
        res.status(500).json({ error: 'Failed to update standings' });
    }
};

const handleDeleteTable = async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const tableId = new ObjectId(req.params.id);

        const result = await tableCollection.deleteOne({ _id: tableId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Table not found' });
        }

        res.status(200).json( {
            message: 'Table deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting table:', error);
        res.status(500).json({ error: 'Failed to delete table' });
    }
};

// ==================== AUTO-CALCULATE STANDINGS FROM FIXTURES ====================

// คำนวณตารางคะแนนจาก fixtures อัตโนมัติ
const calculateStandingsFromFixtures = async () => {
    // ดึง fixtures ที่จบแล้วทั้งหมด
    const completedFixtures = await fixturesCollection
        .find({ status: 'จบการแข่งขัน' })
        .toArray();
    
    // สร้าง object เก็บสถิติแต่ละทีม
    const teamStats = {};
    
    // วนลูปคำนวณสถิติจากทุกแมตช์
    completedFixtures.forEach(fixture => {
        const { team1, team2, score1, score2 } = fixture;
        
        // Initialize team1 ถ้ายังไม่มี
        if (!teamStats[team1]) {
            teamStats[team1] = {
                team: team1,
                played: 0,
                matchWins: 0,
                matchLosses: 0,
                gameWins: 0,
                gameLosses: 0,
                gameDiff: 0,
                points: 0,
                form: []
            };
        }
        
        // Initialize team2 ถ้ายังไม่มี
        if (!teamStats[team2]) {
            teamStats[team2] = {
                team: team2,
                played: 0,
                matchWins: 0,
                matchLosses: 0,
                gameWins: 0,
                gameLosses: 0,
                gameDiff: 0,
                points: 0,
                form: []
            };
        }
        
        // อัปเดตสถิติ
        teamStats[team1].played++;
        teamStats[team2].played++;
        
        // Game wins/losses (สกอร์รายเกม)
        teamStats[team1].gameWins += score1;
        teamStats[team1].gameLosses += score2;
        teamStats[team2].gameWins += score2;
        teamStats[team2].gameLosses += score1;
        
        // Game Difference
        teamStats[team1].gameDiff += (score1 - score2);
        teamStats[team2].gameDiff += (score2 - score1);
        
        // Match wins/losses และ Points
        if (score1 > score2) {
            // Team1 ชนะ
            teamStats[team1].matchWins++;
            teamStats[team1].points += 3;
            teamStats[team1].form.push('W');
            
            teamStats[team2].matchLosses++;
            teamStats[team2].form.push('L');
        } else if (score2 > score1) {
            // Team2 ชนะ
            teamStats[team2].matchWins++;
            teamStats[team2].points += 3;
            teamStats[team2].form.push('W');
            
            teamStats[team1].matchLosses++;
            teamStats[team1].form.push('L');
        }
    });
    
    // แปลงเป็น array และ sort
    const standings = Object.values(teamStats)
        .map(team => ({
            ...team,
            form: team.form.slice(-5) // เก็บแค่ 5 นัดล่าสุด
        }))
        .sort((a, b) => {
            // 1. Points (มากไปน้อย)
            if (b.points !== a.points) return b.points - a.points;
            // 2. Game Difference (มากไปน้อย)
            if (b.gameDiff !== a.gameDiff) return b.gameDiff - a.gameDiff;
            // 3. Game Wins (มากไปน้อย)
            if (b.gameWins !== a.gameWins) return b.gameWins - a.gameWins;
            // 4. ชื่อทีม (A-Z)
            return a.team.localeCompare(b.team);
        })
        .map((team, index) => ({ 
            ...team,
            rank: index + 1
        }));
    
    return standings;
};

// API: ดึงตารางคะแนนที่คำนวณจาก fixtures
app.get('/api/table/calculated', async (req, res) => {
    try {
        const standings = await calculateStandingsFromFixtures();
        
        res.status(200).json( {
            standings: standings,
            calculatedAt: new Date().toISOString(),
            totalTeams: standings.length,
            source: 'fixtures'
        });
    } catch (error) {
        console.error('Error calculating standings:', error);
        res.status(500).json({ error: 'Failed to calculate standings' });
    }
});

// API: คำนวณและบันทึกลง table collection
app.post('/api/table/sync-from-fixtures', async (req, res) => {
    try {
        const standings = await calculateStandingsFromFixtures();
        
        // สร้าง document ใหม่
        const standingsDoc = {
            standings: standings,
            syncedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            source: 'auto-calculated-from-fixtures'
        };
        
        // บันทึกลง database
        const result = await tableCollection.insertOne(standingsDoc);
        
        res.status(201).json( {
            message: 'Standings synced from fixtures successfully',
            id: result.insertedId,
            totalTeams: standings.length,
            standings: standings
        });
    } catch (error) {
        console.error('Error syncing standings:', error);
        res.status(500).json({ error: 'Failed to sync standings' });
    }
});

// Primary routes
app.get('/api/table', handleListTable);
app.get('/api/table/latest', handleLatestTable);
app.post('/api/table', handleCreateTable);
app.put('/api/table/:id', handleUpdateTable);
app.delete('/api/table/:id', handleDeleteTable);

// Standings endpoints removed; use /api/table instead

// ==================== PLAYERS ROUTES ====================

// Get All Players (Sorted by latest)
app.get('/api/players', async (req, res) => {
    try {
        const players = await playersCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        
        res.status(200).json(players);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

// Get Latest Players
app.get('/api/players/latest', async (req, res) => {
    try {
        const latestPlayers = await playersCollection
            .findOne({}, { sort: { createdAt: -1 } });
        
        if (!latestPlayers) {
            return res.status(404).json({ error: 'No players found' });
        }
        
        res.status(200).json(latestPlayers);
    } catch (error) {
        console.error('Error fetching latest players:', error);
        res.status(500).json({ error: 'Failed to fetch latest players' });
    }
});

// Create New Players
app.post('/api/players', async (req, res) => {
    try {
        const playersData = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await playersCollection.insertOne(playersData);
        
        res.status(201).json( {
            message: 'Players created successfully',
            id: result.insertedId,
            data: playersData
        });
    } catch (error) {
        console.error('Error creating players:', error);
        res.status(500).json({ error: 'Failed to create players' });
    }
});

// Update Players by ID
app.put('/api/players/:id', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const playerId = new ObjectId(req.params.id);
        
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };
        
        const result = await playersCollection.updateOne(
            { _id: playerId },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Players not found' });
        }
        
        res.status(200).json( {
            message: 'Players updated successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error updating players:', error);
        res.status(500).json({ error: 'Failed to update players' });
    }
});

// Delete Players by ID
app.delete('/api/players/:id', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const playerId = new ObjectId(req.params.id);
        
        const result = await playersCollection.deleteOne({ _id: playerId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Players not found' });
        }
        
        res.status(200).json( {
            message: 'Players deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting players:', error);
        res.status(500).json({ error: 'Failed to delete players' });
    }
});

// ==================== PLAYER STATS (สถิติผู้เล่นสะสม) ====================

// Role Mapping (ตำแหน่งผู้เล่น)
const PLAYER_ROLES = {
    'Jungle': 'ฟาร์มป่า',
    'DarkSlayerLane': 'เลน Dark Slayer',
    'AbyssalDragonLane': 'เลนมังกร',
    'MidLane': 'เลนกลาง',
    'Roaming': 'โรมมิ่ง'
};

// Helper: แปลง role เป็นภาษาไทย
const getRoleDisplay = (role) => {
    return PLAYER_ROLES[role] || role;
};

// API: ดึงรายการ roles ทั้งหมด
app.get('/api/player-stats/roles', (req, res) => {
    res.status(200).json( {
        roles: PLAYER_ROLES,
        list: Object.entries(PLAYER_ROLES).map(([key, value]) => ({
            id: key,
            name: value
        }))
    });
});

// เพิ่มสถิติผู้เล่นรายเกม (เก็บสะสมไปเรื่อยๆ)
app.post('/api/player-stats', async (req, res) => {
    try {
        const { matchDay, matchNo, gameNo, players } = req.body;
        
        if (!matchDay || !players || !Array.isArray(players)) {
            return res.status(400).json( {
                error: 'Please provide matchDay and players array' 
            });
        }
        
        // Validate roles
        const validRoles = Object.keys(PLAYER_ROLES);
        const invalidPlayers = players.filter(p => p.role && !validRoles.includes(p.role));
        if (invalidPlayers.length > 0) {
            return res.status(400).json( {
                error: 'Invalid role detected',
                invalidPlayers: invalidPlayers.map(p => ({ name: p.name, role: p.role })),
                validRoles: validRoles
            });
        }
        
        // เก็บ record รายเกม
        const statsRecord = {
            matchDay: matchDay,
            matchNo: matchNo || null,
            gameNo: gameNo || null,
            players: players,
            createdAt: new Date()
        };
        
        const result = await playerStatsCollection.insertOne(statsRecord);
        
        res.status(201).json( {
            message: 'Player stats added successfully',
            id: result.insertedId,
            playersCount: players.length
        });
    } catch (error) {
        console.error('Error adding player stats:', error);
        res.status(500).json({ error: 'Failed to add player stats' });
    }
});

// ดึงสถิติรายแมตช์ทั้งหมด
app.get('/api/player-stats', async (req, res) => {
    try {
        const stats = await playerStatsCollection
            .find({})
            .sort({ matchDay: 1, matchNo: 1 })
            .toArray();
        
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).json({ error: 'Failed to fetch player stats' });
    }
});

// ดึงสถิติรายวัน
app.get('/api/player-stats/day/:day', async (req, res) => {
    try {
        const day = parseInt(req.params.day);
        const stats = await playerStatsCollection
            .find({ matchDay: day })
            .sort({ matchNo: 1 })
            .toArray();
        
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching player stats by day:', error);
        res.status(500).json({ error: 'Failed to fetch player stats' });
    }
});

// คำนวณสถิติรวมของผู้เล่นทั้งหมด (Auto Calculate)
const calculatePlayerTotals = async () => {
    // ดึงสถิติทุก record
    const allStats = await playerStatsCollection.find({}).toArray();
    
    // รวมสถิติตาม playerName
    const playerTotals = {};
    
    allStats.forEach(record => {
        record.players.forEach(player => {
            const name = player.name;
            
            if (!playerTotals[name]) {
                playerTotals[name] = {
                    name: name,
                    team: player.team || '',
                    role: player.role || '',
                    roleDisplay: getRoleDisplay(player.role) || '',
                    gamesPlayed: 0,
                    kills: 0,
                    deaths: 0,
                    assists: 0,
                    kda: 0,
                    mvp: 0,
                    gold: 0,
                    minPlayed: 0,
                    damageDealt: 0,
                    damageTaken: 0,
                    matchDays: []
                };
            }
            
            const p = playerTotals[name];
            p.gamesPlayed += player.gamesPlayed || 1;
            p.kills += player.kills || 0;
            p.deaths += player.deaths || 0;
            p.assists += player.assists || 0;
            p.mvp += player.mvp || 0;
            p.gold += player.gold || 0;
            p.minPlayed += player.min || 0;
            p.damageDealt += player.damageDealt || 0;
            p.damageTaken += player.damageTaken || 0;
            
            // เก็บว่าเล่นวันไหนบ้าง
            if (record.matchDay && !p.matchDays.includes(record.matchDay)) {
                p.matchDays.push(record.matchDay);
            }
            
            // อัปเดต team/role ถ้ามีข้อมูลใหม่
            if (player.team) p.team = player.team;
            if (player.role) {
                p.role = player.role;
                p.roleDisplay = getRoleDisplay(player.role);
            }
        });
    });
    
    // คำนวณ KDA และ average stats
    const playersArray = Object.values(playerTotals).map(p => {
        const deaths = p.deaths || 1; // ป้องกันหาร 0
        const totalMin = p.minPlayed || 1; // ป้องกันหาร 0
        
        p.kda = parseFloat(((p.kills + p.assists) / deaths).toFixed(2));
        p.goldPerMin = Math.round(p.gold / totalMin); // คำนวณ Gold/Min
        p.avgKills = parseFloat((p.kills / p.gamesPlayed).toFixed(2));
        p.avgDeaths = parseFloat((p.deaths / p.gamesPlayed).toFixed(2));
        p.avgAssists = parseFloat((p.assists / p.gamesPlayed).toFixed(2));
        p.avgGoldPerMin = Math.round(p.gold / totalMin); // เหมือน goldPerMin
        p.avgDamageDealt = Math.round(p.damageDealt / p.gamesPlayed);
        p.avgDamageTaken = Math.round(p.damageTaken / p.gamesPlayed);
        return p;
    });
    
    // Sort by KDA (สูงสุดก่อน)
    playersArray.sort((a, b) => b.kda - a.kda);
    
    // เพิ่ม rank
    return playersArray.map((p, idx) => ({ ...p, rank: idx + 1 }));
};

// API: ดึงสถิติรวมผู้เล่น (คำนวณ real-time)
app.get('/api/player-stats/totals', async (req, res) => {
    try {
        const totals = await calculatePlayerTotals();
        
        res.status(200).json( {
            players: totals,
            totalPlayers: totals.length,
            calculatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error calculating player totals:', error);
        res.status(500).json({ error: 'Failed to calculate player totals' });
    }
});

// API: ดึง Top Players ตาม stat
app.get('/api/player-stats/top/:stat', async (req, res) => {
    try {
        const stat = req.params.stat; // kills, assists, kda, mvp, etc.
        const limit = parseInt(req.query.limit) || 10;
        
        const totals = await calculatePlayerTotals();
        
        // Sort by requested stat
        const sorted = totals.sort((a, b) => (b[stat] || 0) - (a[stat] || 0));
        
        res.status(200).json( {
            stat: stat,
            top: sorted.slice(0, limit),
            calculatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting top players:', error);
        res.status(500).json({ error: 'Failed to get top players' });
    }
});

// API: ดึงสถิติผู้เล่นคนเดียว
app.get('/api/player-stats/player/:name', async (req, res) => {
    try {
        const playerName = decodeURIComponent(req.params.name);
        const totals = await calculatePlayerTotals();
        
        const player = totals.find(p => 
            p.name.toLowerCase() === playerName.toLowerCase()
        );
        
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        
        // ดึงประวัติรายแมตช์ของผู้เล่นคนนี้
        const allStats = await playerStatsCollection.find({}).toArray();
        const matchHistory = [];
        
        allStats.forEach(record => {
            const playerRecord = record.players.find(p => 
                p.name.toLowerCase() === playerName.toLowerCase()
            );
            if (playerRecord) {
                matchHistory.push( {
                    matchDay: record.matchDay,
                    matchNo: record.matchNo,
                    stats: playerRecord
                });
            }
        });
        
        res.status(200).json( {
            totals: player,
            matchHistory: matchHistory
        });
    } catch (error) {
        console.error('Error getting player stats:', error);
        res.status(500).json({ error: 'Failed to get player stats' });
    }
});

// API: Sync สถิติรวมลง players collection (สำหรับ backup/display)
app.post('/api/player-stats/sync', async (req, res) => {
    try {
        const totals = await calculatePlayerTotals();
        
        const playersDoc = {
            players: totals,
            syncedAt: new Date(),
            createdAt: new Date(),
            source: 'auto-calculated-from-player-stats'
        };
        
        const result = await playersCollection.insertOne(playersDoc);
        
        res.status(201).json( {
            message: 'Player stats synced successfully',
            id: result.insertedId,
            totalPlayers: totals.length
        });
    } catch (error) {
        console.error('Error syncing player stats:', error);
        res.status(500).json({ error: 'Failed to sync player stats' });
    }
});

// API: เพิ่มสถิติหลายแมตช์พร้อมกัน (Bulk)
app.post('/api/player-stats/bulk', async (req, res) => {
    try {
        const { records } = req.body;
        
        if (!records || !Array.isArray(records)) {
            return res.status(400).json({ error: 'Please provide records array' });
        }
        
        const recordsWithTimestamp = records.map(r => ({
            ...r,
            createdAt: new Date()
        }));
        
        const result = await playerStatsCollection.insertMany(recordsWithTimestamp);
        
        res.status(201).json( {
            message: 'Player stats bulk added successfully',
            insertedCount: result.insertedCount
        });
    } catch (error) {
        console.error('Error bulk adding player stats:', error);
        res.status(500).json({ error: 'Failed to bulk add player stats' });
    }
});

// ========================================
// AI MATCH PREDICTION API
// ========================================

// Helper: Calculate team strength score
const calculateTeamStrength = (team) => {
    const winRate = team.matchesPlayed > 0 
        ? (team.matchWins / team.matchesPlayed) * 100 
        : 50;
    const gameWinRate = (team.gameWins + team.gameLosses) > 0
        ? (team.gameWins / (team.gameWins + team.gameLosses)) * 100
        : 50;
    const formScore = team.form 
        ? team.form.slice(-5).reduce((acc, f) => acc + (f === 'W' ? 20 : 0), 0)
        : 50;
    
    // Weighted score: 40% win rate, 30% game win rate, 30% recent form
    return (winRate * 0.4) + (gameWinRate * 0.3) + (formScore * 0.3);
};

// Helper: Generate AI insight text
const generateInsight = (team1, team2, team1Strength, team2Strength, prediction) => {
    const diff = Math.abs(team1Strength - team2Strength);
    const favorite = team1Strength > team2Strength ? team1.teamName : team2.teamName;
    const underdog = team1Strength > team2Strength ? team2.teamName : team1.teamName;
    
    let insight = '';
    
    if (diff < 10) {
        insight = `🔥 แมตช์สูสี! ทั้ง ${team1.teamName} และ ${team2.teamName} มีความแข็งแกร่งใกล้เคียงกัน ผลลัพธ์ยากต่อการคาดเดา`;
    } else if (diff < 25) {
        insight = `⚔️ ${favorite} มีความได้เปรียบเล็กน้อย แต่ ${underdog} ยังมีโอกาสพลิกสถานการณ์ได้`;
    } else {
        insight = `🏆 ${favorite} เป็นตัวเต็งอย่างชัดเจน ด้วยฟอร์มและสถิติที่เหนือกว่า`;
    }
    
    // Add form analysis
    const team1Form = team1.form?.slice(-3).join('') || 'N/A';
    const team2Form = team2.form?.slice(-3).join('') || 'N/A';
    insight += `\n\n📊 ฟอร์ม 3 นัดหลังสุด:\n• ${team1.teamName}: ${team1Form}\n• ${team2.teamName}: ${team2Form}`;
    
    // Add key stats
    insight += `\n\n📈 สถิติสำคัญ:`;
    insight += `\n• ${team1.teamName}: ${team1.matchWins}W-${team1.matchLosses}L (GD: ${team1.gameDiff > 0 ? '+' : ''}${team1.gameDiff})`;
    insight += `\n• ${team2.teamName}: ${team2.matchWins}W-${team2.matchLosses}L (GD: ${team2.gameDiff > 0 ? '+' : ''}${team2.gameDiff})`;
    
    return insight;
};

// GET /api/predictions - Get predictions for upcoming matches
app.get('/api/predictions', async (req, res) => {
    try {
        // Get all teams data
        const teams = await tableCollection.find({}).toArray();
        const teamsMap = {};
        teams.forEach(team => {
            teamsMap[team.teamName] = team;
        });
        
        // Get schedule
        const scheduleDoc = await schedulesCollection.findOne({}, { sort: { createdAt: -1 } });
        if (!scheduleDoc || !scheduleDoc.schedule) {
            return res.status(404).json({ error: 'No schedule found' });
        }
        
        // Find next day to predict (first day with unplayed matches)
        const day = parseInt(req.query.day) || 2; // Default to day 2
        const daySchedule = scheduleDoc.schedule.find(d => d.day === day);
        
        if (!daySchedule) {
            return res.status(404).json({ error: `No matches found for day ${day}` });
        }
        
        // Generate predictions for each match
        const predictions = daySchedule.matches.map(match => {
            const team1 = teamsMap[match.blue] || { 
                teamName: match.blue, matchWins: 0, matchLosses: 0, 
                gameWins: 0, gameLosses: 0, gameDiff: 0, matchesPlayed: 0, form: []
            };
            const team2 = teamsMap[match.red] || { 
                teamName: match.red, matchWins: 0, matchLosses: 0, 
                gameWins: 0, gameLosses: 0, gameDiff: 0, matchesPlayed: 0, form: []
            };
            
            const team1Strength = calculateTeamStrength(team1);
            const team2Strength = calculateTeamStrength(team2);
            const total = team1Strength + team2Strength;
            
            const team1WinProb = Math.round((team1Strength / total) * 100);
            const team2WinProb = 100 - team1WinProb;
            
            // Predicted winner
            const predictedWinner = team1WinProb > team2WinProb ? match.blue : match.red;
            const confidence = Math.max(prob1, prob2);
            
            // Predicted score (Bo3)
            let predictedScore;
            if (confidence > 70) {
                predictedScore = '2-0';
            } else if (confidence > 55) {
                predictedScore = '2-1';
            } else {
                predictedScore = '2-1'; // Close match
            }
            
            return {
                match: { blue: match.blue, red: match.red },
                prediction: {
                    winner: predictedWinner,
                    confidence: confidence,
                    predictedScore: predictedScore,
                    probabilities: {
                        [match.blue]: team1WinProb,
                        [match.red]: team2WinProb
                    }
                },
                analysis: {
                    blueStrength: Math.round(team1Strength),
                    redStrength: Math.round(team2Strength),
                    insight: generateInsight(team1, team2, team1Strength, team2Strength, predictedWinner)
                },
                teamStats: {
                    blue: {
                        rank: team1.rank || '-',
                        form: team1.form || [],
                        record: `${team1.matchWins}W-${team1.matchLosses}L`,
                        gameDiff: team1.gameDiff || 0
                    },
                    red: {
                        rank: team2.rank || '-',
                        form: team2.form || [],
                        record: `${team2.matchWins}W-${team2.matchLosses}L`,
                        gameDiff: team2.gameDiff || 0
                    }
                }
            };
        });
        
        res.status(200).json( {
            day: day,
            type: daySchedule.type,
            totalMatches: predictions.length,
            predictions: predictions,
            generatedAt: new Date().toISOString(),
            disclaimer: '⚠️ การทำนายนี้อิงจากสถิติและฟอร์มเท่านั้น ผลการแข่งขันจริงอาจแตกต่างได้'
        });
        
    } catch (error) {
        console.error('Error generating predictions:', error);
        res.status(500).json({ error: 'Failed to generate predictions' });
    }
});

// GET /api/predictions/match - Predict a specific match
app.get('/api/predictions/match', async (req, res) => {
    try {
        const { team1, team2 } = req.query;
        
        if (!team1 || !team2) {
            return res.status(400).json({ error: 'Please provide team1 and team2 query parameters' });
        }
        
        // Get teams data
        const teams = await tableCollection.find({
            teamName: { $in: [team1, team2] }
        }).toArray();
        
        const teamsMap = {};
        teams.forEach(team => {
            teamsMap[team.teamName] = team;
        });
        
        const teamData1 = teamsMap[team1] || { 
            teamName: team1, matchWins: 0, matchLosses: 0, 
            gameWins: 0, gameLosses: 0, gameDiff: 0, matchesPlayed: 0, form: []
        };
        const teamData2 = teamsMap[team2] || { 
            teamName: team2, matchWins: 0, matchLosses: 0, 
            gameWins: 0, gameLosses: 0, gameDiff: 0, matchesPlayed: 0, form: []
        };
        
        const strength1 = calculateTeamStrength(teamData1);
        const strength2 = calculateTeamStrength(teamData2);
        const total = strength1 + strength2;
        
        const prob1 = Math.round((strength1 / total) * 100);
        const prob2 = 100 - prob1;
        
        const predictedWinner = prob1 > prob2 ? team1 : team2;
        const confidence = Math.max(prob1, prob2);
        
        res.status(200).json({
            match: { blue: team1, red: team2 },
            prediction: {
                winner: predictedWinner,
                confidence: confidence,
                probabilities: {
                    [team1]: prob1,
                    [team2]: prob2
                }
            },
            analysis: {
                insight: generateInsight(teamData1, teamData2, strength1, strength2, predictedWinner)
            },
            teamStats: {
                [team1]: {
                    rank: teamData1.rank || '-',
                    form: teamData1.form || [],
                    record: `${teamData1.matchWins}W-${teamData1.matchLosses}L`,
                    points: teamData1.points || 0
                },
                [team2]: {
                    rank: teamData2.rank || '-',
                    form: teamData2.form || [],
                    record: `${team2.matchWins}W-${team2.matchLosses}L`,
                    points: teamData2.points || 0
                }
            },
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error predicting match:', error);
        res.status(500).json({ error: 'Failed to predict match' });
    }
});

// ==================== PRODUCTION CLIENT SERVING ====================
// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// The "catchall" handler: for any request that doesn't match an API route,
// send back React's index.html file.
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
    } else {
        // This else block handles non-existent API routes
        res.status(404).json({ error: `API route not found: ${req.path}` });
    }
});


// Start Server
const startServer = async () => {
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
        console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
        console.log(`📊 Schedules: http://localhost:${PORT}/api/schedules`);
        console.log(`🏆 Table: http://localhost:${PORT}/api/table`);
        console.log(`👥 Players: http://localhost:${PORT}/api/players`);
    });
};

startServer();
