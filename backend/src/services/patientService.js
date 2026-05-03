import { ApiError } from '../utils/apiError.js';

export class PatientService {
  constructor({ patientRepository, activityLogRepository }) {
    this.patientRepository = patientRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async createPatient(payload, actorId) {
    const patient = await this.patientRepository.create(payload);

    if (actorId) {
      await this.activityLogRepository.create({
        userId: actorId,
        action: 'PATIENT_CREATED',
        entity: 'Patient',
        entityId: patient.id,
        metadata: {},
      });
    }

    return patient;
  }

  listPatients(search = '') {
    return search ? this.patientRepository.search(search) : this.patientRepository.list();
  }

  async updatePatient(id, payload, actorId) {
    const patient = await this.patientRepository.update(id, payload);

    if (actorId) {
      await this.activityLogRepository.create({
        userId: actorId,
        action: 'PATIENT_UPDATED',
        entity: 'Patient',
        entityId: id,
        metadata: {},
      });
    }

    return patient;
  }

  async getPatientDetails(id) {
    const patient = await this.patientRepository.findById(id);

    if (!patient) {
      throw new ApiError(404, 'Paciente não encontrado');
    }

    return patient;
  }
}
