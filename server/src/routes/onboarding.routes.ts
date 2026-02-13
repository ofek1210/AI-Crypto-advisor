import { Router } from 'express';
import { getMine, saveMine } from '../controllers/onboarding.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/me', requireAuth, getMine);
router.post('/', requireAuth, saveMine);

export default router;
