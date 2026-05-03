export class PatientRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create(data) {
    return this.prisma.patient.create({ data });
  }

  update(id, data) {
    return this.prisma.patient.update({ where: { id }, data });
  }

  findById(id) {
    return this.prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: true,
        medicalRecords: { orderBy: { createdAt: 'desc' } },
        anamneses: { orderBy: { version: 'desc' } },
      },
    });
  }

  search(term) {
    return this.prisma.patient.findMany({
      where: {
        OR: [
          { fullName: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { document: { contains: term, mode: 'insensitive' } },
        ],
      },
      orderBy: { fullName: 'asc' },
    });
  }

  list() {
    return this.prisma.patient.findMany({ orderBy: { fullName: 'asc' } });
  }
}
