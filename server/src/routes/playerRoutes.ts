import { Router } from 'express';
import {
    getPlayers,
    importPlayers,
    clearAllPlayers,
    getUnmatchedIGNs,
    addPreviousIGN,
    updateIGN
} from '../controllers/playerController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    importPlayersSchema,
    playerIdParamSchema,
    previousIGNSchema,
    newIGNSchema
} from '../validations/schemas';

const router = Router();

router.get('/', getPlayers);
router.post('/import', authenticateToken, validate(importPlayersSchema), importPlayers);
router.delete('/all/clear', authenticateToken, clearAllPlayers);
router.get('/unmatched-igns', authenticateToken, getUnmatchedIGNs);
router.post('/:playerId/add-previous-ign', authenticateToken, validate(playerIdParamSchema, 'params'), validate(previousIGNSchema), addPreviousIGN);
router.patch('/:playerId/update-ign', authenticateToken, validate(playerIdParamSchema, 'params'), validate(newIGNSchema), updateIGN);

export default router;
