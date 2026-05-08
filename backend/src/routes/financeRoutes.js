import { Router } from 'express';
import { container } from '../container.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import {
  treatmentCreateSchema,
  treatmentUpdateStatusSchema,
  paymentRegisterSchema,
  paymentCreateSchema,
  paymentStatusSchema,
} from '../schemas/financeSchemas.js';

const router = Router();

// Aplicar autenticação em todas as rotas de finance
router.use(authenticate);

// ========== ROTAS DE TRATAMENTOS ==========

// Criar novo tratamento com parcelas
router.post('/treatments', validate(treatmentCreateSchema), container.financeController.createTreatment);

// Listar todos os tratamentos (com filtros opcionais: ?patientId=xxx&status=xxx)
router.get('/treatments', container.financeController.listTreatments);

// Obter um tratamento específico
router.get('/treatments/:id', container.financeController.getTreatment);

// Atualizar status de um tratamento
router.patch('/treatments/:id/status', validate(treatmentUpdateStatusSchema), container.financeController.updateTreatmentStatus);

// Obter tratamentos de um paciente específico
router.get('/patients/:patientId/treatments', container.financeController.getPatientTreatments);

// Obter resumo financeiro de um paciente
router.get('/patients/:patientId/financial-summary', container.financeController.getPatientFinancialSummary);

// Obter parcelas de um tratamento específico
router.get('/treatments/:treatmentId/payments', container.financeController.getTreatmentPayments);

// ========== ROTAS DE PAGAMENTOS ==========

// Registrar pagamento de uma parcela
router.post('/payments/:id/register', validate(paymentRegisterSchema), container.financeController.registerPayment);

// Cancelar/reverter um pagamento
router.post('/payments/:id/cancel', container.financeController.cancelPayment);

// Obter um pagamento específico
router.get('/payments/:id', container.financeController.getPayment);

// Listar pagamentos (com filtros opcionais: ?treatmentId=xxx&status=xxx)
router.get('/payments', container.financeController.listPayments);

// Listar pagamentos em atraso
router.get('/payments/overdue/list', container.financeController.getOverduePayments);

// ========== ROTAS LEGADAS (manter compatibilidade) ==========

// Criar pagamento manual (sem tratamento)
router.post('/', validate(paymentCreateSchema), container.financeController.createPayment);

// Atualizar status de pagamento (legado)
router.patch('/:id/status', validate(paymentStatusSchema), container.financeController.updateStatus);

// Listar todos os pagamentos (legado)
router.get('/', container.financeController.list);

export default router;
