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

// CORS configuration - allows localhost in development
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow any localhost or 127.0.0.1 with any port
    if (env.nodeEnv === 'development') {
      const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
      if (localhostRegex.test(origin)) {
        return callback(null, true);
      }
    }
    
    // Check against configured origins
    const allowedOrigins = Array.isArray(env.corsOrigin) ? env.corsOrigin : [env.corsOrigin];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

export const securityStack = [
  helmet(),
  cors(corsOptions),
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
