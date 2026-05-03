import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { container } from '../container.js';

const router = Router();

router.post('/whatsapp/webhook', authenticate, authorize('ADMIN', 'RECEPTION'), container.integrationController.whatsappWebhook);

export default router;
