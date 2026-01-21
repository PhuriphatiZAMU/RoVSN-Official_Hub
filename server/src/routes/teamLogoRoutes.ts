import { Router } from 'express';
import { getTeamLogos, saveTeamLogo, deleteTeamLogo } from '../controllers/teamLogoController';
import { authenticateToken } from '../middleware/auth';
import { cacheControl } from '../middleware/cache';
import { validate } from '../middleware/validate';
import { teamLogoSchema, teamNameParamSchema } from '../validations/schemas';

const router = Router();

router.get('/', cacheControl(300), getTeamLogos);
router.post('/', authenticateToken, validate(teamLogoSchema), saveTeamLogo);
router.delete('/:teamName', authenticateToken, validate(teamNameParamSchema, 'params'), deleteTeamLogo);

export default router;
