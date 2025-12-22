const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

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
        
        console.log('📦 Database:', db.databaseName);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

// Routes

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'Server is running',
        database: db ? 'connected' : 'disconnected'
    });
});

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
        
        res.status(201).json({ 
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
        
        res.status(200).json({ 
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
        
        res.status(200).json({ 
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
        
        res.status(200).json({ 
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
        
        res.status(200).json({ 
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
            return res.status(400).json({ 
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
        
        res.status(200).json({ 
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
        
        res.status(200).json({ 
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

        res.status(201).json({
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

        res.status(200).json({
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

        res.status(200).json({
            message: 'Table deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting table:', error);
        res.status(500).json({ error: 'Failed to delete table' });
    }
};

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
        
        res.status(201).json({ 
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
        
        res.status(200).json({ 
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
        
        res.status(200).json({ 
            message: 'Players deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting players:', error);
        res.status(500).json({ error: 'Failed to delete players' });
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
