import { z } from 'zod';

export const appointmentCreateSchema = z.object({
  patientId: z.uuid(),
  dentistId: z.uuid(),
  receptionistId: z.uuid().optional().nullable(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  notes: z.string().optional().nullable(),
  amount: z.coerce.number().positive('Valor deve ser maior que zero').optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELED']).default('SCHEDULED'),
});

export const appointmentStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELED']),
});
