export class AnamnesisRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createVersion(data) {
    const lastVersion = await this.prisma.anamnesis.findFirst({
      where: { patientId: data.patientId },
      orderBy: { version: 'desc' },
    });

    return this.prisma.anamnesis.create({
      data: {
        ...data,
        version: (lastVersion?.version || 0) + 1,
      },
    });
  }

  listByPatient(patientId) {
    return this.prisma.anamnesis.findMany({
      where: { patientId },
      orderBy: { version: 'desc' },
    });
  }

  findById(id) {
    return this.prisma.anamnesis.findUnique({
      where: { id },
    });
  }

  async update(id, data) {
    return this.prisma.anamnesis.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return this.prisma.anamnesis.delete({
      where: { id },
    });
  }
}
