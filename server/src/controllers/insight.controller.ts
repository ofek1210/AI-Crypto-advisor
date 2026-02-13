import { Request, Response, NextFunction } from 'express';
import { getDailyInsight, type InsightContext } from '../services/ai.service.js';

export const getDaily = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const req = _req as Request;
    const context: InsightContext = {
      assetInterests:
        typeof req.query.assetInterests === 'string' ? req.query.assetInterests : undefined,
      investorType:
        typeof req.query.investorType === 'string' ? req.query.investorType : undefined,
      contentType:
        typeof req.query.contentType === 'string' ? req.query.contentType : undefined
    };

    const insight = await getDailyInsight(context);
    res.json(insight);
  } catch (err) {
    next(err);
  }
};
