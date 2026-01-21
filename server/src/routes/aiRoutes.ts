import { Router } from 'express';
import multer from 'multer';
import { extractRovStats } from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';

const uploadMemory = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post('/extract-rov-stats', authenticateToken, uploadMemory.single('image'), extractRovStats);

export default router;
