import { asyncHandler } from '../utils/asyncHandler.js';

export class IntegrationController {
  constructor({ activityLogRepository }) {
    this.activityLogRepository = activityLogRepository;
  }

  whatsappWebhook = asyncHandler(async (req, res) => {
    await this.activityLogRepository.create({
      clinicId: req.user.clinicId,
      userId: req.user.id,
      action: 'WHATSAPP_WEBHOOK_RECEIVED',
      entity: 'Integration',
      entityId: req.user.id,
      metadata: req.body,
    });

    res.json({ message: 'Webhook recebido e registrado' });
  });
}
