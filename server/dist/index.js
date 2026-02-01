"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Database connection
const db_1 = __importDefault(require("./config/db"));
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const scheduleRoutes_1 = __importDefault(require("./routes/scheduleRoutes"));
const resultRoutes_1 = __importDefault(require("./routes/resultRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
const playerRoutes_1 = __importDefault(require("./routes/playerRoutes"));
const teamLogoRoutes_1 = __importDefault(require("./routes/teamLogoRoutes"));
const heroRoutes_1 = __importDefault(require("./routes/heroRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const standingsRoutes_1 = __importDefault(require("./routes/standingsRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// --- Middleware ---
app.use((0, compression_1.default)());
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)({
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
// Static uploads folder
const localUploadDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(localUploadDir)) {
    fs_1.default.mkdirSync(localUploadDir, { recursive: true });
}
app.use('/uploads', express_1.default.static(localUploadDir));
// --- Database Connection ---
(0, db_1.default)();
// --- Base Routes ---
app.get('/', (req, res) => {
    res.send('<h1>RoV SN Tournament API</h1><p>Status: Online</p>');
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: '2.0' });
});
// --- API Routes ---
app.use('/api/auth', authRoutes_1.default);
app.use('/api/schedules', scheduleRoutes_1.default);
app.use('/api/results', resultRoutes_1.default);
app.use('/api/stats', statsRoutes_1.default);
app.use('/api', statsRoutes_1.default); // Also mount at /api for /api/player-stats, /api/team-stats, etc.
app.use('/api/players', playerRoutes_1.default);
app.use('/api/team-logos', teamLogoRoutes_1.default);
app.use('/api/heroes', heroRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/standings', standingsRoutes_1.default);
app.use('/api', aiRoutes_1.default); // For /api/extract-rov-stats
// --- Serve Static Assets (Production/Deployment) ---
const clientBuildPath = path_1.default.join(__dirname, '../../client/dist');
if (fs_1.default.existsSync(clientBuildPath)) {
    console.log("📂 Serving static files from client/dist");
    app.use(express_1.default.static(clientBuildPath));
    // SPA Fallback: Serve index.html for any unknown route
    app.get('*', (req, res) => {
        // Don't catch API routes - let them 404 properly
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.sendFile(path_1.default.join(clientBuildPath, 'index.html'));
    });
}
else {
    console.log("⚠️ No client build found in client/dist. API Mode only.");
}
// --- Start Server ---
if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
exports.default = app;
