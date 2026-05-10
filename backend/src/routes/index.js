import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import patientRoutes from './patientRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import clinicRoutes from './clinicRoutes.js';
import recordRoutes from './recordRoutes.js';
import financeRoutes from './financeRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import logRoutes from './logRoutes.js';
import integrationRoutes from './integrationRoutes.js';
import { createClinicalRecordRoutes } from './clinicalRecordRoutes.js';
import { createOdontogramRoutes } from './odontogramRoutes.js';
import { createAttachmentRoutes } from './attachmentRoutes.js';
import { container } from '../container.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.use('/auth', authRoutes);
router.use(authenticate);
router.use('/clinics', clinicRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/records', recordRoutes);
router.use('/clinical-records', createClinicalRecordRoutes(container));
router.use('/odontograms', createOdontogramRoutes(container));
router.use('/attachments', createAttachmentRoutes(container));
router.use('/finance', financeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/logs', logRoutes);
router.use('/integrations', integrationRoutes);

export default router;
