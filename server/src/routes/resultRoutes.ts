import { Router } from 'express';
import { getResults, saveResult, deleteResult, resetDayResults } from '../controllers/resultController';
import { authenticateToken } from '../middleware/auth';
import { cacheControl } from '../middleware/cache';
import { validate } from '../middleware/validate';
import { saveResultSchema, matchIdParamSchema, dayParamSchema } from '../validations/schemas';

const router = Router();

router.get('/', cacheControl(60), getResults);
router.post('/', authenticateToken, validate(saveResultSchema), saveResult);
router.delete('/:matchId', authenticateToken, validate(matchIdParamSchema, 'params'), deleteResult);
router.delete('/reset/:day', authenticateToken, validate(dayParamSchema, 'params'), resetDayResults);

export default router;
