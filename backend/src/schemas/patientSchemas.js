import { z } from 'zod';

export const patientCreateSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(8),
  birthDate: z.coerce.date(),
  document: z.string().min(11),
  address: z.string().min(3),
  lgpdConsent: z.boolean(),
});

export const patientUpdateSchema = patientCreateSchema.partial();
