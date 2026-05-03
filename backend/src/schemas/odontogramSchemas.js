import { z } from 'zod';

export const createOdontogramSchema = z.object({
  teeth: z.record(z.any()).optional(),
  observations: z.string().optional(),
});

export const updateOdontogramSchema = z.object({
  teeth: z.record(z.any()).optional(),
  observations: z.string().optional(),
});

export const updateToothSchema = z.object({
  status: z.enum(['healthy', 'caries', 'missing', 'restored', 'root'], {
    errorMap: () => ({ message: 'Status do dente inválido' }),
  }),
  notes: z.string().optional(),
});
