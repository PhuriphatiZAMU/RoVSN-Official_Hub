import { Router } from 'express';
import { getStandings, getDetailedStandings } from '../controllers/standingsController';
import { cacheControl } from '../middleware/cache';

const router = Router();

// Public routes - standings calculated from database
router.get('/', cacheControl(60), getStandings);
router.get('/detailed', cacheControl(60), getDetailedStandings);

export default router;
