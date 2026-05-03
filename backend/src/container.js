import { prisma } from './config/prisma.js';
import { UserRepository } from './repositories/userRepository.js';
import { PatientRepository } from './repositories/patientRepository.js';
import { AppointmentRepository } from './repositories/appointmentRepository.js';
import { MedicalRecordRepository } from './repositories/medicalRecordRepository.js';
import { AnamnesisRepository } from './repositories/anamnesisRepository.js';
import { PaymentRepository } from './repositories/paymentRepository.js';
import { DashboardRepository } from './repositories/dashboardRepository.js';
import { ActivityLogRepository } from './repositories/activityLogRepository.js';
import { PasswordResetRepository } from './repositories/passwordResetRepository.js';
import { AuthService } from './services/authService.js';
import { UserService } from './services/userService.js';
import { PatientService } from './services/patientService.js';
import { AppointmentService } from './services/appointmentService.js';
import { MedicalRecordService } from './services/medicalRecordService.js';
import { AnamnesisService } from './services/anamnesisService.js';
import { FinanceService } from './services/financeService.js';
import { DashboardService } from './services/dashboardService.js';
import { AuthController } from './controllers/authController.js';
import { UserController } from './controllers/userController.js';
import { PatientController } from './controllers/patientController.js';
import { AppointmentController } from './controllers/appointmentController.js';
import { MedicalRecordController } from './controllers/medicalRecordController.js';
import { AnamnesisController } from './controllers/anamnesisController.js';
import { FinanceController } from './controllers/financeController.js';
import { DashboardController } from './controllers/dashboardController.js';
import { LogController } from './controllers/logController.js';
import { IntegrationController } from './controllers/integrationController.js';
import { ClinicalRecordRepository } from './repositories/clinicalRecordRepository.js';
import { OdontogramRepository } from './repositories/odontogramRepository.js';
import { AttachmentRepository } from './repositories/attachmentRepository.js';
import { ClinicalRecordService } from './services/clinicalRecordService.js';
import { OdontogramService } from './services/odontogramService.js';
import { AttachmentService } from './services/attachmentService.js';
import { ClinicalRecordController } from './controllers/clinicalRecordController.js';
import { OdontogramController } from './controllers/odontogramController.js';
import { AttachmentController } from './controllers/attachmentController.js';

const userRepository = new UserRepository(prisma);
const patientRepository = new PatientRepository(prisma);
const appointmentRepository = new AppointmentRepository(prisma);
const medicalRecordRepository = new MedicalRecordRepository(prisma);
const anamnesisRepository = new AnamnesisRepository(prisma);
const paymentRepository = new PaymentRepository(prisma);
const dashboardRepository = new DashboardRepository(prisma);
const activityLogRepository = new ActivityLogRepository(prisma);
const passwordResetRepository = new PasswordResetRepository(prisma);
const clinicalRecordRepository = new ClinicalRecordRepository();
const odontogramRepository = new OdontogramRepository();
const attachmentRepository = new AttachmentRepository();

const authService = new AuthService({ userRepository, passwordResetRepository, activityLogRepository });
const userService = new UserService({ userRepository });
const patientService = new PatientService({ patientRepository, activityLogRepository });
const appointmentService = new AppointmentService({ appointmentRepository, paymentRepository, activityLogRepository });
const medicalRecordService = new MedicalRecordService({ medicalRecordRepository, activityLogRepository });
const anamnesisService = new AnamnesisService({ anamnesisRepository, activityLogRepository });
const financeService = new FinanceService({ paymentRepository, activityLogRepository });
const dashboardService = new DashboardService({ dashboardRepository, appointmentRepository });
const clinicalRecordService = new ClinicalRecordService({ clinicalRecordRepository });
const odontogramService = new OdontogramService({ odontogramRepository });
const attachmentService = new AttachmentService({ attachmentRepository });

export const container = {
	activityLogRepository,
	authController: new AuthController({ authService }),
	userController: new UserController({ userService }),
	patientController: new PatientController({ patientService }),
	appointmentController: new AppointmentController({ appointmentService }),
	medicalRecordController: new MedicalRecordController({ medicalRecordService }),
	anamnesisController: new AnamnesisController({ anamnesisService }),
	financeController: new FinanceController({ financeService }),
	dashboardController: new DashboardController({ dashboardService }),
	logController: new LogController({ activityLogRepository }),
	integrationController: new IntegrationController({ activityLogRepository }),
	clinicalRecordController: new ClinicalRecordController({ clinicalRecordService }),
	odontogramController: new OdontogramController({ odontogramService }),
	attachmentController: new AttachmentController({ attachmentService }),
	get(name) {
		return this[name];
	},
};
