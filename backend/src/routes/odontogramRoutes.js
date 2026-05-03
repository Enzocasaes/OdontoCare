import { Router } from 'express';
import { validate } from '../middlewares/validateMiddleware.js';
import {
  createOdontogramSchema,
  updateOdontogramSchema,
  updateToothSchema,
} from '../schemas/odontogramSchemas.js';

export function createOdontogramRoutes(container) {
  const router = Router();
  const odontogramController = container.get('odontogramController');

  // Criar novo odontograma para paciente
  router.post(
    '/patient/:patientId',
    validate(createOdontogramSchema),
    odontogramController.create
  );

  // Obter odontograma do paciente
  router.get('/patient/:patientId', odontogramController.getByPatient);

  // Atualizar odontograma
  router.patch(
    '/patient/:patientId',
    validate(updateOdontogramSchema),
    odontogramController.update
  );

  // Atualizar dente específico
  router.patch(
    '/patient/:patientId/tooth/:toothNumber',
    validate(updateToothSchema),
    odontogramController.updateTooth
  );

  // Deletar odontograma
  router.delete(
    '/patient/:patientId',
    odontogramController.delete
  );

  return router;
}
