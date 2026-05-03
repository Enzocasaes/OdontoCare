import { z } from 'zod';

export const paymentCreateSchema = z.object({
  patientId: z.uuid(),
  appointmentId: z.uuid().optional().nullable(),
  amount: z.number().positive(),
  dueDate: z.coerce.date(),
  method: z.string().min(2),
  status: z.enum(['PENDING', 'PAID']).default('PENDING'),
});

export const paymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID']),
});
