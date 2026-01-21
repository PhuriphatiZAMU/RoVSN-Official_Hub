import { Router } from 'express';
import {
    getPlayerStats,
    getTeamStats,
    getSeasonStats,
    saveStats,
    getMatchStats,
    getPlayerHeroStats
} from '../controllers/statsController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { saveStatsSchema, matchIdQuerySchema } from '../validations/schemas';

const router = Router();

router.get('/player-stats', getPlayerStats);
router.get('/team-stats', getTeamStats);
router.get('/season-stats', getSeasonStats);
router.get('/player-hero-stats', getPlayerHeroStats);

router.post('/', authenticateToken, validate(saveStatsSchema), saveStats);
router.get('/match', validate(matchIdQuerySchema, 'query'), getMatchStats);

export default router;
