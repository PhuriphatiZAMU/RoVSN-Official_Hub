import { Router } from 'express';
import { getHeroes, uploadHeroes, clearAllHeroes } from '../controllers/heroController';
import { authenticateToken } from '../middleware/auth';
import { cacheControl } from '../middleware/cache';
import upload from '../middleware/upload';

const router = Router();

router.get('/', cacheControl(600), getHeroes);
router.post('/upload', authenticateToken, upload.any(), uploadHeroes);
router.delete('/all/clear', authenticateToken, clearAllHeroes);

export default router;
