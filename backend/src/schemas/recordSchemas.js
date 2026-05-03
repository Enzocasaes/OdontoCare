import { z } from 'zod';

export const medicalRecordSchema = z.object({
  patientId: z.uuid(),
  dentistId: z.uuid(),
  appointmentId: z.uuid().optional().nullable(),
  diagnosis: z.string().min(3),
  treatmentPlan: z.string().min(3),
  evolution: z.string().min(3),
});

export const anamnesisSchema = z.object({
  patientId: z.uuid(),
  createdById: z.uuid().optional().nullable(),
  allergies: z.string().min(2).optional().or(z.literal('')),
  medications: z.string().min(2).optional().or(z.literal('')),
  systemicDiseases: z.string().min(2).optional().or(z.literal('')),
  notes: z.string().min(2).optional().or(z.literal('')),
});

export const anamnesisUpdateSchema = z.object({
  allergies: z.string().min(2).optional().or(z.literal('')),
  medications: z.string().min(2).optional().or(z.literal('')),
  systemicDiseases: z.string().min(2).optional().or(z.literal('')),
  notes: z.string().min(2).optional().or(z.literal('')),
});
