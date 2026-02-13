import { Request, Response, NextFunction } from 'express';
import { VoteModel } from '../models/vote.model.js';
import { AppError } from '../utils/appError.js';

export const createVote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { source, value } = req.body as {
      source?: 'insight' | 'news' | 'meme' | 'prices';
      value?: 'up' | 'down';
    };

    if (!source || !value) {
      throw new AppError('Missing required fields', 400);
    }

    const vote = await VoteModel.create({ user: userId, source, value });

    res.status(201).json({ id: vote._id.toString(), source: vote.source, value: vote.value });
  } catch (err) {
    next(err);
  }
};
