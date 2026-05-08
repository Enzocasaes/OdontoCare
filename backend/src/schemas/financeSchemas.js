import { z } from 'zod';

// ========== SCHEMAS DE TRATAMENTO ==========

export const treatmentCreateSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  description: z.string().min(3, 'Descrição do tratamento deve ter no mínimo 3 caracteres'),
  totalAmount: z.number().positive('Valor total deve ser positivo'),
  installments: z
    .number()
    .int('Número de parcelas deve ser um número inteiro')
    .min(1, 'Deve haver pelo menos 1 parcela')
    .max(48, 'Número máximo de parcelas é 48'),
  firstDueDate: z.coerce.date(),
  observations: z.string().optional(),
});

export const treatmentUpdateStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'], {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
});

// ========== SCHEMAS DE PAGAMENTO ==========

export const paymentRegisterSchema = z.object({
  method: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER', 'PIX'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
});

export const paymentCreateSchema = z.object({
  treatmentId: z.string().uuid('ID do tratamento inválido'),
  amount: z.number().positive('Valor deve ser positivo'),
  installmentNumber: z.number().int().positive('Número da parcela inválido'),
  totalInstallments: z.number().int().positive('Total de parcelas inválido'),
  dueDate: z.coerce.date(),
  method: z
    .enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER', 'PIX'])
    .optional()
    .nullable(),
  status: z.enum(['PENDING', 'PAID']).default('PENDING'),
});

export const paymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID']),
});

// ========== SCHEMAS DE FILTROS ==========

export const treatmentFilterSchema = z.object({
  patientId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']).optional(),
});

export const paymentFilterSchema = z.object({
  treatmentId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'PAID']).optional(),
});

