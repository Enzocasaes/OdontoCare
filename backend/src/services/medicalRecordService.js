export class MedicalRecordService {
  constructor({ medicalRecordRepository, activityLogRepository }) {
    this.medicalRecordRepository = medicalRecordRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async createRecord(payload, clinicId, actorId) {
    const record = await this.medicalRecordRepository.create({
      ...payload,
      clinicId,
    });

    await this.activityLogRepository.create({
      clinicId,
      userId: actorId,
      action: 'MEDICAL_RECORD_CREATED',
      entity: 'MedicalRecord',
      entityId: record.id,
      metadata: { patientId: payload.patientId },
    });

    return record;
  }

  listByPatient(patientId, clinicId) {
    return this.medicalRecordRepository.listByPatient(patientId, clinicId);
  }
}
