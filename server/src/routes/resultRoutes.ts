import { Router } from 'express';
import {
    getResults,
    saveResult,
    deleteResult,
    resetDayResults,
    getResultHistory,
    getRecentChanges,
    validateResult
} from '../controllers/resultController';
import { authenticateToken } from '../middleware/auth';
import { cacheControl } from '../middleware/cache';
import { validate } from '../middleware/validate';
import { saveResultSchema, matchIdParamSchema, dayParamSchema } from '../validations/schemas';

const router = Router();

// Public routes
router.get('/', cacheControl(60), getResults);

// Protected routes
router.post('/', authenticateToken, validate(saveResultSchema), saveResult);
router.delete('/:matchId', authenticateToken, validate(matchIdParamSchema, 'params'), deleteResult);
router.delete('/reset/:day', authenticateToken, validate(dayParamSchema, 'params'), resetDayResults);

// History & Validation routes
router.get('/history', authenticateToken, getResultHistory);
router.get('/recent-changes', authenticateToken, getRecentChanges);
router.post('/validate', authenticateToken, validateResult);

export default router;
