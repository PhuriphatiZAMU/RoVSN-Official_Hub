import { Router } from 'express';
import { getLatestSchedule, createSchedule, clearAllData } from '../controllers/scheduleController';
import { authenticateToken } from '../middleware/auth';
import { cacheControl } from '../middleware/cache';
import { validate } from '../middleware/validate';
import { createScheduleSchema } from '../validations/schemas';

const router = Router();

router.get('/', cacheControl(120), getLatestSchedule);
router.post('/', authenticateToken, validate(createScheduleSchema), createSchedule);
router.delete('/clear', authenticateToken, clearAllData);

export default router;
