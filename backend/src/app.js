import express from 'express';
import routes from './routes/index.js';
import { csrfProtection, securityStack } from './middlewares/securityMiddleware.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

const shouldSkipCsrf = (path) =>
  ['/api/auth/login', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/health'].includes(path);

export const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(securityStack);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !shouldSkipCsrf(req.path)) {
    return csrfProtection(req, res, next);
  }

  return next();
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);
