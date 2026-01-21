import { Router } from 'express';
import { login, verify } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema } from '../validations/schemas';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/verify', authenticateToken, verify);

export default router;
