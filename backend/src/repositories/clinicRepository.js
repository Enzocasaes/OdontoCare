export class ClinicRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create(data) {
    return this.prisma.clinic.create({ data });
  }

  findAll() {
    return this.prisma.clinic.findMany({
      orderBy: { name: 'asc' },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });
  }

  findById(id) {
    return this.prisma.clinic.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });
  }

  findByUserId(userId) {
    return this.prisma.clinic.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { name: 'asc' },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });
  }

  findMember(clinicId, userId) {
    return this.prisma.clinicMember.findUnique({
      where: {
        clinicId_userId: { clinicId, userId },
      },
      include: {
        clinic: true,
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  addMember(clinicId, userId) {
    return this.prisma.clinicMember.create({
      data: { clinicId, userId },
      include: {
        clinic: true,
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  update(clinicId, data) {
    return this.prisma.clinic.update({
      where: { id: clinicId },
      data,
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });
  }

  delete(clinicId) {
    return this.prisma.clinic.delete({
      where: { id: clinicId },
    });
  }
}