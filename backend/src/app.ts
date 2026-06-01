import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { healthRouter } from './modules/health/health.routes';

export const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use('/health', healthRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error
    ? Number(error.statusCode)
    : 500;

  const message = error instanceof Error ? error.message : 'Unexpected server error';

  res.status(statusCode).json({ message });
});
