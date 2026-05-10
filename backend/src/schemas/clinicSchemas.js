import { z } from 'zod';

const normalizeCnpj = (value) => value.replace(/\D/g, '');

export const clinicCreateSchema = z.object({
  name: z.string().min(3, 'Nome do consultório deve ter no mínimo 3 caracteres'),
  address: z.string().trim().min(5, 'Endereço completo é obrigatório'),
  cnpj: z
    .string()
    .trim()
    .transform(normalizeCnpj)
    .refine((value) => value.length === 14, 'CNPJ deve conter 14 dígitos'),
});

export const clinicMemberSchema = z
  .object({
    userId: z.string().uuid('ID do usuário inválido').optional(),
    email: z.string().email('Email inválido').optional(),
  })
  .refine((data) => data.userId || data.email, {
    message: 'Informe userId ou email',
    path: ['userId'],
  });