import { Request, Response, NextFunction } from 'express';
import { OnboardingModel } from '../models/onboarding.model.js';
import { AppError } from '../utils/appError.js';

export const getMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const record = await OnboardingModel.findOne({ user: userId });

    if (!record) {
      return res.json({ completed: false });
    }

    return res.json({
      completed: true,
      preferences: {
        assetInterests: record.assetInterests,
        investorType: record.investorType,
        contentType: record.contentType
      }
    });
  } catch (err) {
    next(err);
  }
};

export const saveMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { assetInterests, investorType, contentType } = req.body as {
      assetInterests?: string;
      investorType?: string;
      contentType?: string;
    };

    if (!assetInterests || !investorType || !contentType) {
      throw new AppError('Missing required fields', 400);
    }

    const record = await OnboardingModel.findOneAndUpdate(
      { user: userId },
      { user: userId, assetInterests, investorType, contentType },
      { new: true, upsert: true }
    );

    res.status(201).json({
      completed: true,
      preferences: {
        assetInterests: record.assetInterests,
        investorType: record.investorType,
        contentType: record.contentType
      }
    });
  } catch (err) {
    next(err);
  }
};
