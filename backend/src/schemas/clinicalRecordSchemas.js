import { z } from 'zod';

export const createClinicalRecordSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),
  appointmentId: z.union([z.string().uuid('ID da consulta inválido'), z.literal('')]).optional(),
  procedures: z.string().min(3, 'Descrição dos procedimentos deve ter no mínimo 3 caracteres'),
  diagnosis: z.string().min(3, 'Diagnóstico deve ter no mínimo 3 caracteres'),
  treatmentPlan: z.string().min(3, 'Plano de tratamento deve ter no mínimo 3 caracteres'),
  notes: z.string().optional(),
});

export const updateClinicalRecordSchema = z.object({
  procedures: z.string().min(3, 'Descrição dos procedimentos deve ter no mínimo 3 caracteres').optional(),
  diagnosis: z.string().min(3, 'Diagnóstico deve ter no mínimo 3 caracteres').optional(),
  treatmentPlan: z.string().min(3, 'Plano de tratamento deve ter no mínimo 3 caracteres').optional(),
  notes: z.string().optional(),
});
