import { Request, Response, NextFunction } from 'express';
import { VoteModel } from '../models/vote.model.js';
import { AppError } from '../utils/appError.js';

export const createVote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source, value } = req.body as {
      source?: 'insight' | 'news' | 'meme' | 'dashboard';
      value?: 'up' | 'down';
    };

    if (!source || !value) {
      throw new AppError('Missing required fields', 400);
    }

    const vote = await VoteModel.create({ source, value });

    res.status(201).json({ id: vote._id.toString(), source: vote.source, value: vote.value });
  } catch (err) {
    next(err);
  }
};
