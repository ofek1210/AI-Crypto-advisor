import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';

export type AuthResult = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

const signToken = (userId: string) => {
  const secret = env.JWT_SECRET as Secret;
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn']
  };

  return jwt.sign({ sub: userId }, secret, options);
};

export const register = async (params: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthResult> => {
  const existing = await UserModel.findOne({ email: params.email });
  if (existing) {
    throw new AppError('Email already in use', 409);
  }

  const passwordHash = await bcrypt.hash(params.password, 10);
  const user = await UserModel.create({
    email: params.email,
    passwordHash,
    name: params.name
  });

  const token = signToken(user._id.toString());

  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    }
  };
};

export const login = async (params: {
  email: string;
  password: string;
}): Promise<AuthResult> => {
  const user = await UserModel.findOne({ email: params.email });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const ok = await bcrypt.compare(params.password, user.passwordHash);
  if (!ok) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = signToken(user._id.toString());

  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    }
  };
};
