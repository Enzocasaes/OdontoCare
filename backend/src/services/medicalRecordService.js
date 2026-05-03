export class MedicalRecordService {
  constructor({ medicalRecordRepository, activityLogRepository }) {
    this.medicalRecordRepository = medicalRecordRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async createRecord(payload, actorId) {
    const record = await this.medicalRecordRepository.create(payload);

    await this.activityLogRepository.create({
      userId: actorId,
      action: 'MEDICAL_RECORD_CREATED',
      entity: 'MedicalRecord',
      entityId: record.id,
      metadata: { patientId: payload.patientId },
    });

    return record;
  }

  listByPatient(patientId) {
    return this.medicalRecordRepository.listByPatient(patientId);
  }
}
