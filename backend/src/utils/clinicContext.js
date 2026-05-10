import { ApiError } from './apiError.js';

export const requireClinicId = (user) => {
  if (!user?.clinicId) {
    throw new ApiError(400, 'Consultório do usuário não informado');
  }

  return user.clinicId;
};