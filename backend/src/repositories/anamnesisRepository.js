export class AnamnesisRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createVersion(data) {
    const lastVersion = await this.prisma.anamnesis.findFirst({
      where: { patientId: data.patientId, clinicId: data.clinicId },
      orderBy: { version: 'desc' },
    });

    return this.prisma.anamnesis.create({
      data: {
        ...data,
        version: (lastVersion?.version || 0) + 1,
      },
    });
  }

  listByPatient(patientId, clinicId) {
    return this.prisma.anamnesis.findMany({
      where: { patientId, clinicId },
      orderBy: { version: 'desc' },
    });
  }

  findById(id, clinicId) {
    return this.prisma.anamnesis.findFirst({
      where: { id, clinicId },
    });
  }

  async update(id, clinicId, data) {
    const anamnesis = await this.prisma.anamnesis.findFirst({ where: { id, clinicId } });

    if (!anamnesis) {
      return null;
    }

    return this.prisma.anamnesis.update({
      where: { id },
      data,
    });
  }

  async delete(id, clinicId) {
    const anamnesis = await this.prisma.anamnesis.findFirst({ where: { id, clinicId } });

    if (!anamnesis) {
      return null;
    }

    return this.prisma.anamnesis.delete({
      where: { id },
    });
  }
}
