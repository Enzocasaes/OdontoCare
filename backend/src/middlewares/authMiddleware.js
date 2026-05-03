import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';

export const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next(new ApiError(401, 'N\u00e3o autenticado'));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new ApiError(401, 'Token inv\u00e1lido ou expirado'));
  }
};
