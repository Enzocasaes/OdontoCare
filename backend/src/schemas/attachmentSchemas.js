import { z } from 'zod';

export const uploadAttachmentSchema = z.object({
  category: z.enum(['raio-x', 'foto', 'documento', 'exame', 'outro'], {
    errorMap: () => ({ message: 'Categoria inválida' }),
  }).default('outro'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  clinicalRecordId: z.string().uuid('ID da ficha clínica inválido').optional(),
});

export const updateAttachmentSchema = z.object({
  category: z.enum(['raio-x', 'foto', 'documento', 'exame', 'outro'], {
    errorMap: () => ({ message: 'Categoria inválida' }),
  }).optional(),
  description: z.string().max(500, 'Descrição muito longa').optional(),
});
