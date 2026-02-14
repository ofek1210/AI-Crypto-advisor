import dotenv from 'dotenv';

dotenv.config();

type Env = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  CRYPTOPANIC_TOKEN?: string;
  COINGECKO_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
};

const getEnv = (key: keyof Env): string | undefined => process.env[key];

const requireEnv = (key: keyof Env): string => {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
};

export const env: Env = {
  NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) || 'development',
  PORT: Number(process.env.PORT || 4000),
  MONGODB_URI: requireEnv('MONGODB_URI'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  CRYPTOPANIC_TOKEN: process.env.CRYPTOPANIC_TOKEN,
  COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL
};
