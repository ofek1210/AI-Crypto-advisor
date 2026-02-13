import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import insightRoutes from './routes/insight.routes.js';
import voteRoutes from './routes/vote.routes.js';
import onboardingRoutes from './routes/onboarding.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

const parseOrigins = (value?: string) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => origin.replace(/^['"]|['"]$/g, ''));

const allowedOrigins = parseOrigins(env.CORS_ORIGIN);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.includes(origin);
      return callback(null, isAllowed);
    },
    credentials: true
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/insight', insightRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/onboarding', onboardingRoutes);

app.use(errorHandler);

export default app;
