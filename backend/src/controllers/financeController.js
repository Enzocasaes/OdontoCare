import { asyncHandler } from '../utils/asyncHandler.js';

export class FinanceController {
  constructor({ financeService }) {
    this.financeService = financeService;
  }

  createPayment = asyncHandler(async (req, res) => {
    const payment = await this.financeService.createPayment(req.body, req.user.id);
    res.status(201).json(payment);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const payment = await this.financeService.updatePaymentStatus(req.params.id, req.body.status, req.user.id);
    res.json(payment);
  });

  list = asyncHandler(async (_req, res) => {
    const payments = await this.financeService.listPayments();
    res.json(payments);
  });
}
