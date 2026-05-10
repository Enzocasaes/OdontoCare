import { ApiError } from '../utils/apiError.js';

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
  async createTreatment(payload, clinicId, actorId) {
    const { patientId, description, totalAmount, installments, firstDueDate, observations } = payload;

    // Calcula valor de cada parcela
    const installmentAmount = parseFloat((totalAmount / installments).toFixed(2));
    const lastInstallmentAmount = parseFloat((totalAmount - installmentAmount * (installments - 1)).toFixed(2));

    // Cria o tratamento com todas as parcelas de uma vez
    const treatment = await this.treatmentRepository.create({
      clinicId,
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
            clinicId,
          };
        }),
      },
    });

    await this.activityLogRepository.create({
      clinicId,
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
  async getTreatment(id, clinicId) {
    return this.treatmentRepository.findById(id, clinicId);
  }

  /**
   * Lista tratamentos com filtros opcionais
   */
  async listTreatments(filters = {}, clinicId) {
    return this.treatmentRepository.list({ ...filters, clinicId });
  }

  /**
   * Lista tratamentos de um paciente específico
   */
  async getPatientTreatments(patientId, filters = {}, clinicId) {
    return this.treatmentRepository.findByPatient(patientId, clinicId, filters);
  }

  /**
   * Atualiza o status de um tratamento
   */
  async updateTreatmentStatus(id, status, clinicId, actorId) {
    const updateData = { status };
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const treatment = await this.treatmentRepository.update(id, clinicId, updateData);

    if (!treatment) {
      throw new ApiError(404, 'Tratamento não encontrado');
    }

    await this.activityLogRepository.create({
      clinicId,
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
  async getPatientFinancialSummary(patientId, clinicId) {
    return this.treatmentRepository.getPatientFinancialSummary(patientId, clinicId);
  }

  // ========== PAGAMENTOS ==========

  /**
   * Registra o pagamento de uma parcela
   */
  async registerPayment(paymentId, payload, clinicId, actorId) {
    const { method } = payload;
    
    const payment = await this.paymentRepository.updateStatus(
      paymentId,
      clinicId,
      'PAID',
      new Date(),
      method
    );

    if (!payment) {
      throw new ApiError(404, 'Pagamento não encontrado');
    }

    // Verifica se todas as parcelas do tratamento foram pagas
    const allPayments = await this.paymentRepository.findByTreatment(payment.treatment.id, clinicId);
    const allPaid = allPayments.every((p) => p.status === 'PAID');

    // Se todas as parcelas foram pagas, atualiza o status do tratamento
    if (allPaid) {
      await this.updateTreatmentStatus(payment.treatment.id, 'COMPLETED', clinicId, actorId);
    }

    await this.activityLogRepository.create({
      clinicId,
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
  async cancelPayment(paymentId, clinicId, actorId) {
    const payment = await this.paymentRepository.updateStatus(
      paymentId,
      clinicId,
      'PENDING',
      null,
      null
    );

    if (!payment) {
      throw new ApiError(404, 'Pagamento não encontrado');
    }

    await this.activityLogRepository.create({
      clinicId,
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
  async listPayments(filters = {}, clinicId) {
    return this.paymentRepository.list({ ...filters, clinicId });
  }

  /**
   * Busca um pagamento por ID
   */
  async getPayment(id, clinicId) {
    return this.paymentRepository.findById(id, clinicId);
  }

  /**
   * Lista pagamentos em atraso
   */
  async getOverduePayments(clinicId) {
    return this.paymentRepository.findOverdue(clinicId);
  }

  /**
   * Lista parcelas de um tratamento específico
   */
  async getTreatmentPayments(treatmentId, clinicId) {
    return this.paymentRepository.findByTreatment(treatmentId, clinicId);
  }

  // ========== MÉTODOS LEGADOS (manter compatibilidade) ==========

  async createPayment(payload, clinicId, actorId) {
    // Método legado - mantido para compatibilidade
    const payment = await this.paymentRepository.create({
      ...payload,
      clinicId,
    });

    await this.activityLogRepository.create({
      clinicId,
      userId: actorId,
      action: 'PAYMENT_CREATED',
      entity: 'Payment',
      entityId: payment.id,
      metadata: { status: payment.status },
    });

    return payment;
  }

  async updatePaymentStatus(id, status, clinicId, actorId) {
    // Método legado - mantido para compatibilidade
    const payment = await this.paymentRepository.updateStatus(
      id,
      clinicId,
      status,
      status === 'PAID' ? new Date() : null
    );

    if (!payment) {
      throw new ApiError(404, 'Pagamento não encontrado');
    }

    await this.activityLogRepository.create({
      clinicId,
      userId: actorId,
      action: 'PAYMENT_STATUS_UPDATED',
      entity: 'Payment',
      entityId: payment.id,
      metadata: { status },
    });

    return payment;
  }
}

