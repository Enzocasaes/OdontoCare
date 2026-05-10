import { ApiError } from '../utils/apiError.js';

export class PatientService {
  constructor({ patientRepository, activityLogRepository }) {
    this.patientRepository = patientRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async createPatient(payload, clinicId, actorId) {
    const patient = await this.patientRepository.create({
      ...payload,
      clinicId,
    });

    if (actorId) {
      await this.activityLogRepository.create({
        clinicId,
        userId: actorId,
        action: 'PATIENT_CREATED',
        entity: 'Patient',
        entityId: patient.id,
        metadata: {},
      });
    }

    return patient;
  }

  listPatients(search = '', clinicId) {
    return search ? this.patientRepository.search(search, clinicId) : this.patientRepository.list(clinicId);
  }

  async updatePatient(id, payload, clinicId, actorId) {
    const patient = await this.patientRepository.update(id, clinicId, payload);

    if (!patient) {
      throw new ApiError(404, 'Paciente não encontrado');
    }

    if (actorId) {
      await this.activityLogRepository.create({
        clinicId,
        userId: actorId,
        action: 'PATIENT_UPDATED',
        entity: 'Patient',
        entityId: id,
        metadata: {},
      });
    }

    return patient;
  }

  async getPatientDetails(id, clinicId) {
    const patient = await this.patientRepository.findById(id, clinicId);

    if (!patient) {
      throw new ApiError(404, 'Paciente não encontrado');
    }

    return patient;
  }
}
