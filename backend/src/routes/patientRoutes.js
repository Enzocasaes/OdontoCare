import { Router } from 'express';
import { container } from '../container.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { patientCreateSchema, patientUpdateSchema } from '../schemas/patientSchemas.js';

const router = Router();

router.get('/', container.patientController.list);
router.get('/:id', container.patientController.details);
router.post('/', validate(patientCreateSchema), container.patientController.create);
router.put('/:id', validate(patientUpdateSchema), container.patientController.update);

export default router;
