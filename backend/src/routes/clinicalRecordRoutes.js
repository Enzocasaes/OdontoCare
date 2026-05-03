import { Router } from 'express';
import { validate } from '../middlewares/validateMiddleware.js';
import {
  createClinicalRecordSchema,
  updateClinicalRecordSchema,
} from '../schemas/clinicalRecordSchemas.js';

export function createClinicalRecordRoutes(container) {
  const router = Router();
  const clinicalRecordController = container.get('clinicalRecordController');

  // Criar nova ficha clínica
  router.post(
    '/',
    validate(createClinicalRecordSchema),
    clinicalRecordController.create
  );

  // Obter ficha clínica por ID
  router.get('/:id', clinicalRecordController.getById);

  // Listar fichas clínicas do paciente
  router.get('/patient/:patientId', clinicalRecordController.listByPatient);

  // Obter última ficha clínica do paciente
  router.get('/patient/:patientId/latest', clinicalRecordController.getLatest);

  // Atualizar ficha clínica
  router.patch(
    '/:id',
    validate(updateClinicalRecordSchema),
    clinicalRecordController.update
  );

  // Deletar ficha clínica
  router.delete(
    '/:id',
    clinicalRecordController.delete
  );

  return router;
}
