import { Router } from 'express';
import { createVote } from '../controllers/vote.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/', requireAuth, createVote);

export default router;
