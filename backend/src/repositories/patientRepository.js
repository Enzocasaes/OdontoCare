export class PatientRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create(data) {
    return this.prisma.patient.create({
      data,
      include: {
        appointments: true,
        medicalRecords: { orderBy: { createdAt: 'desc' } },
        anamneses: { orderBy: { version: 'desc' } },
      },
    });
  }

  async update(id, clinicId, data) {
    const patient = await this.prisma.patient.findFirst({ where: { id, clinicId } });

    if (!patient) {
      return null;
    }

    return this.prisma.patient.update({
      where: { id },
      data,
      include: {
        appointments: true,
        medicalRecords: { orderBy: { createdAt: 'desc' } },
        anamneses: { orderBy: { version: 'desc' } },
      },
    });
  }

  findById(id, clinicId) {
    return this.prisma.patient.findFirst({
      where: { id, clinicId },
      include: {
        appointments: true,
        medicalRecords: { orderBy: { createdAt: 'desc' } },
        anamneses: { orderBy: { version: 'desc' } },
      },
    });
  }

  search(term, clinicId) {
    return this.prisma.patient.findMany({
      where: {
        clinicId,
        OR: [
          { fullName: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { document: { contains: term, mode: 'insensitive' } },
        ],
      },
      orderBy: { fullName: 'asc' },
    });
  }

  list(clinicId) {
    return this.prisma.patient.findMany({
      where: { clinicId },
      orderBy: { fullName: 'asc' },
    });
  }
}
