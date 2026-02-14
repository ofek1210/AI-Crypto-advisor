import { Request, Response } from 'express';
import { getDashboardSummary } from '../services/dashboard.service.js';

export const getSummary = async (_req: Request, res: Response) => {
  const summary = await getDashboardSummary();
  res.json(summary);
};
