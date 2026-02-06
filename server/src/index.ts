import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection
import connectDB from './config/db';

// Routes
import authRoutes from './routes/authRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import resultRoutes from './routes/resultRoutes';
import statsRoutes from './routes/statsRoutes';
import playerRoutes from './routes/playerRoutes';
import teamLogoRoutes from './routes/teamLogoRoutes';
import heroRoutes from './routes/heroRoutes';
import uploadRoutes from './routes/uploadRoutes';
import aiRoutes from './routes/aiRoutes';
import standingsRoutes from './routes/standingsRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(compression());
app.use(bodyParser.json());
app.use(cors({
    origin: process.env.CLIENT_URL || true, // Use defined Client URL or allow all if not set (for dev)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static uploads folder
const localUploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(localUploadDir)) {
    fs.mkdirSync(localUploadDir, { recursive: true });
}
app.use('/uploads', express.static(localUploadDir));

// --- Database Connection ---
connectDB();

// --- Base Routes ---
app.get('/', (req: Request, res: Response) => {
    res.send('<h1>RoV SN Tournament API</h1><p>Status: Online</p>');
});

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', version: '2.0' });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', statsRoutes); // Also mount at /api for /api/player-stats, /api/team-stats, etc.
app.use('/api/players', playerRoutes);
app.use('/api/team-logos', teamLogoRoutes);
app.use('/api/heroes', heroRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api', aiRoutes); // For /api/extract-rov-stats

// --- Serve Static Assets (Production/Deployment) ---
const clientBuildPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientBuildPath)) {
    console.log("📂 Serving static files from client/dist");
    app.use(express.static(clientBuildPath));
    // SPA Fallback: Serve index.html for any unknown route
    app.get('*', (req: Request, res: Response) => {
        // Don't catch API routes - let them 404 properly
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
} else {
    console.log("⚠️ No client build found in client/dist. API Mode only.");
}

// --- Start Server ---
if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

export default app;
