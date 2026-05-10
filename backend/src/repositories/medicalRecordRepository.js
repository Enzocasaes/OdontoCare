export class MedicalRecordRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create(data) {
    return this.prisma.medicalRecord.create({ data, include: { patient: true, dentist: true } });
  }

  listByPatient(patientId, clinicId) {
    return this.prisma.medicalRecord.findMany({
      where: { patientId, clinicId },
      include: { dentist: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
