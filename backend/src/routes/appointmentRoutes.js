import { Router } from 'express';
import { container } from '../container.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { appointmentCreateSchema, appointmentStatusSchema } from '../schemas/appointmentSchemas.js';

const router = Router();

router.get('/', container.appointmentController.listByPeriod);
router.get('/today', container.appointmentController.listToday);
router.get('/:id', container.appointmentController.getById);
router.post('/', validate(appointmentCreateSchema), container.appointmentController.create);
router.patch('/:id/status', validate(appointmentStatusSchema), container.appointmentController.updateStatus);

export default router;
