import { asyncHandler } from '../utils/asyncHandler.js';

export class FinanceController {
  constructor({ financeService }) {
    this.financeService = financeService;
  }

  // ========== TRATAMENTOS ==========

  createTreatment = asyncHandler(async (req, res) => {
    const treatment = await this.financeService.createTreatment(req.body, req.user?.clinicId, req.user.id);
    res.status(201).json(treatment);
  });

  getTreatment = asyncHandler(async (req, res) => {
    const treatment = await this.financeService.getTreatment(req.params.id, req.user?.clinicId);
    if (!treatment) {
      return res.status(404).json({ message: 'Tratamento não encontrado' });
    }
    res.json(treatment);
  });

  listTreatments = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.patientId) filters.patientId = req.query.patientId;
    if (req.query.status) filters.status = req.query.status;

    const treatments = await this.financeService.listTreatments(filters, req.user?.clinicId);
    res.json(treatments);
  });

  getPatientTreatments = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;

    const treatments = await this.financeService.getPatientTreatments(
      req.params.patientId,
      filters,
      req.user?.clinicId
    );
    res.json(treatments);
  });

  updateTreatmentStatus = asyncHandler(async (req, res) => {
    const treatment = await this.financeService.updateTreatmentStatus(
      req.params.id,
      req.body.status,
      req.user?.clinicId,
      req.user.id
    );
    res.json(treatment);
  });

  getPatientFinancialSummary = asyncHandler(async (req, res) => {
    const summary = await this.financeService.getPatientFinancialSummary(req.params.patientId, req.user?.clinicId);
    res.json(summary);
  });

  // ========== PAGAMENTOS ==========

  registerPayment = asyncHandler(async (req, res) => {
    const payment = await this.financeService.registerPayment(
      req.params.id,
      req.body,
      req.user?.clinicId,
      req.user.id
    );
    res.json(payment);
  });

  cancelPayment = asyncHandler(async (req, res) => {
    const payment = await this.financeService.cancelPayment(req.params.id, req.user?.clinicId, req.user.id);
    res.json(payment);
  });

  getPayment = asyncHandler(async (req, res) => {
    const payment = await this.financeService.getPayment(req.params.id, req.user?.clinicId);
    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
    res.json(payment);
  });

  listPayments = asyncHandler(async (req, res) => {
    const filters = {};
    if (req.query.treatmentId) filters.treatmentId = req.query.treatmentId;
    if (req.query.status) filters.status = req.query.status;

    const payments = await this.financeService.listPayments(filters, req.user?.clinicId);
    res.json(payments);
  });

  getOverduePayments = asyncHandler(async (req, res) => {
    const payments = await this.financeService.getOverduePayments(req.user?.clinicId);
    res.json(payments);
  });

  getTreatmentPayments = asyncHandler(async (req, res) => {
    const payments = await this.financeService.getTreatmentPayments(req.params.treatmentId, req.user?.clinicId);
    res.json(payments);
  });

  // ========== MÉTODOS LEGADOS ==========

  createPayment = asyncHandler(async (req, res) => {
    const payment = await this.financeService.createPayment(req.body, req.user?.clinicId, req.user.id);
    res.status(201).json(payment);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const payment = await this.financeService.updatePaymentStatus(
      req.params.id,
      req.body.status,
      req.user?.clinicId,
      req.user.id
    );
    res.json(payment);
  });

  list = asyncHandler(async (req, res) => {
    const payments = await this.financeService.listPayments({}, req.user?.clinicId);
    res.json(payments);
  });
}

