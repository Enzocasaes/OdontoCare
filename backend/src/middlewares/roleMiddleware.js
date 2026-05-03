import { ApiError } from '../utils/apiError.js';

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Acesso negado'));
  }

  next();
};
