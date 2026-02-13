import { Request, Response, NextFunction } from 'express';
import { getDailyInsight } from '../services/ai.service.js';

export const getDaily = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const insight = await getDailyInsight();
    res.json(insight);
  } catch (err) {
    next(err);
  }
};
