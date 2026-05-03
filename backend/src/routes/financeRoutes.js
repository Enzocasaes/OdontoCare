import { Router } from 'express';
import { container } from '../container.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { paymentCreateSchema, paymentStatusSchema } from '../schemas/financeSchemas.js';

const router = Router();

router.get('/', container.financeController.list);
router.post('/', validate(paymentCreateSchema), container.financeController.createPayment);
router.patch('/:id/status', validate(paymentStatusSchema), container.financeController.updateStatus);

export default router;
