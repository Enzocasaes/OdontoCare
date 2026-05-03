import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import { env } from '../config/env.js';

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return value.replace(/<script.*?>.*?<\/script>/gi, '').trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)]));
  }

  return value;
};

export const securityStack = [
  helmet(),
  cors({ origin: env.corsOrigin, credentials: true }),
  compression(),
  cookieParser(),
  morgan('dev'),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  (req, _res, next) => {
    req.body = sanitizeValue(req.body);
    next();
  },
];

export const csrfProtection = csrf({ cookie: true });
