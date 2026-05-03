import { ApiError } from '../utils/apiError.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    return next(new ApiError(400, 'Validação falhou', result.error.flatten()));
  }

  req[source] = result.data;
  next();
};
