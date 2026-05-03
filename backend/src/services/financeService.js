export class FinanceService {
  constructor({ paymentRepository, activityLogRepository }) {
    this.paymentRepository = paymentRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async createPayment(payload, actorId) {
    const payment = await this.paymentRepository.create(payload);

    await this.activityLogRepository.create({
      userId: actorId,
      action: 'PAYMENT_CREATED',
      entity: 'Payment',
      entityId: payment.id,
      metadata: { status: payment.status },
    });

    return payment;
  }

  async updatePaymentStatus(id, status, actorId) {
    const payment = await this.paymentRepository.updateStatus(
      id,
      status,
      status === 'PAID' ? new Date() : null,
    );

    await this.activityLogRepository.create({
      userId: actorId,
      action: 'PAYMENT_STATUS_UPDATED',
      entity: 'Payment',
      entityId: payment.id,
      metadata: { status },
    });

    return payment;
  }

  listPayments() {
    return this.paymentRepository.list();
  }
}
