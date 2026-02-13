import { Router } from 'express';
import { getDaily } from '../controllers/insight.controller.js';

const router = Router();

router.get('/daily', getDaily);

export default router;
