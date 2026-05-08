export class FinanceService {
  constructor({ paymentRepository, treatmentRepository, activityLogRepository }) {
    this.paymentRepository = paymentRepository;
    this.treatmentRepository = treatmentRepository;
    this.activityLogRepository = activityLogRepository;
  }

  // ========== TRATAMENTOS ==========

  /**
   * Cria um novo tratamento com parcelas automáticas
   * @param {Object} payload - Dados do tratamento
   * @param {string} payload.patientId - ID do paciente
   * @param {string} payload.description - Descrição do tratamento
   * @param {number} payload.totalAmount - Valor total do tratamento
   * @param {number} payload.installments - Número de parcelas
   * @param {Date} payload.firstDueDate - Data de vencimento da primeira parcela
   * @param {string} actorId - ID do usuário que está criando
   * @returns {Promise<Treatment>}
   */
  async createTreatment(payload, actorId) {
    const { patientId, description, totalAmount, installments, firstDueDate, observations } = payload;

    // Calcula valor de cada parcela
    const installmentAmount = parseFloat((totalAmount / installments).toFixed(2));
    const lastInstallmentAmount = parseFloat((totalAmount - installmentAmount * (installments - 1)).toFixed(2));

    // Cria o tratamento com todas as parcelas de uma vez
    const treatment = await this.treatmentRepository.create({
      patientId,
      description,
      totalAmount,
      observations,
      payments: {
        create: Array.from({ length: installments }, (_, index) => {
          const dueDate = new Date(firstDueDate);
          dueDate.setMonth(dueDate.getMonth() + index);

          return {
            amount: index === installments - 1 ? lastInstallmentAmount : installmentAmount,
            installmentNumber: index + 1,
            totalInstallments: installments,
            dueDate,
            status: 'PENDING',
          };
        }),
      },
    });

    await this.activityLogRepository.create({
      userId: actorId,
      action: 'TREATMENT_CREATED',
      entity: 'Treatment',
      entityId: treatment.id,
      metadata: {
        patientId,
        totalAmount,
        installments,
      },
    });

    return treatment;
  }

  /**
   * Busca um tratamento por ID
   */
  async getTreatment(id) {
    return this.treatmentRepository.findById(id);
  }

  /**
   * Lista tratamentos com filtros opcionais
   */
  async listTreatments(filters = {}) {
    return this.treatmentRepository.list(filters);
  }

  /**
   * Lista tratamentos de um paciente específico
   */
  async getPatientTreatments(patientId, filters = {}) {
    return this.treatmentRepository.findByPatient(patientId, filters);
  }

  /**
   * Atualiza o status de um tratamento
   */
  async updateTreatmentStatus(id, status, actorId) {
    const updateData = { status };
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const treatment = await this.treatmentRepository.update(id, updateData);

    await this.activityLogRepository.create({
      userId: actorId,
      action: 'TREATMENT_STATUS_UPDATED',
      entity: 'Treatment',
      entityId: treatment.id,
      metadata: { status },
    });

    return treatment;
  }

  /**
   * Obtém resumo financeiro do paciente
   */
  async getPatientFinancialSummary(patientId) {
    return this.treatmentRepository.getPatientFinancialSummary(patientId);
  }

  // ========== PAGAMENTOS ==========

  /**
   * Registra o pagamento de uma parcela
   */
  async registerPayment(paymentId, payload, actorId) {
    const { method } = payload;
    
    const payment = await this.paymentRepository.updateStatus(
      paymentId,
      'PAID',
      new Date(),
      method
    );

    // Verifica se todas as parcelas do tratamento foram pagas
    const allPayments = await this.paymentRepository.findByTreatment(payment.treatment.id);
    const allPaid = allPayments.every((p) => p.status === 'PAID');

    // Se todas as parcelas foram pagas, atualiza o status do tratamento
    if (allPaid) {
      await this.updateTreatmentStatus(payment.treatment.id, 'COMPLETED', actorId);
    }

    await this.activityLogRepository.create({
      userId: actorId,
      action: 'PAYMENT_REGISTERED',
      entity: 'Payment',
      entityId: payment.id,
      metadata: {
        treatmentId: payment.treatment.id,
        amount: payment.amount.toString(),
        method,
      },
    });

    return payment;
  }

  /**
   * Cancela/reverte um pagamento
   */
  async cancelPayment(paymentId, actorId) {
    const payment = await this.paymentRepository.updateStatus(
      paymentId,
      'PENDING',
      null,
      null
    );

    await this.activityLogRepository.create({
      userId: actorId,
      action: 'PAYMENT_CANCELED',
      entity: 'Payment',
      entityId: payment.id,
      metadata: {
        treatmentId: payment.treatment.id,
      },
    });

    return payment;
  }

  /**
   * Lista todos os pagamentos com filtros opcionais
   */
  async listPayments(filters = {}) {
    return this.paymentRepository.list(filters);
  }

  /**
   * Busca um pagamento por ID
   */
  async getPayment(id) {
    return this.paymentRepository.findById(id);
  }

  /**
   * Lista pagamentos em atraso
   */
  async getOverduePayments() {
    return this.paymentRepository.findOverdue();
  }

  /**
   * Lista parcelas de um tratamento específico
   */
  async getTreatmentPayments(treatmentId) {
    return this.paymentRepository.findByTreatment(treatmentId);
  }

  // ========== MÉTODOS LEGADOS (manter compatibilidade) ==========

  async createPayment(payload, actorId) {
    // Método legado - mantido para compatibilidade
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
    // Método legado - mantido para compatibilidade
    const payment = await this.paymentRepository.updateStatus(
      id,
      status,
      status === 'PAID' ? new Date() : null
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
}

