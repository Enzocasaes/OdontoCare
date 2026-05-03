import { Router } from 'express';
import { container } from '../container.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { medicalRecordSchema, anamnesisSchema, anamnesisUpdateSchema } from '../schemas/recordSchemas.js';

const router = Router();

router.post('/medical', validate(medicalRecordSchema), container.medicalRecordController.create);
router.get('/medical/:patientId', container.medicalRecordController.listByPatient);
router.post('/anamnesis', validate(anamnesisSchema), container.anamnesisController.create);
router.get('/anamnesis/:patientId', container.anamnesisController.listByPatient);
router.put('/anamnesis/:id', validate(anamnesisUpdateSchema), container.anamnesisController.update);
router.delete('/anamnesis/:id', container.anamnesisController.delete);

export default router;
