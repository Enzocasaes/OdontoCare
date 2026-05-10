export class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  findByEmail(email) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByEmailWithClinics(email) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        clinicMemberships: {
          include: {
            clinic: true,
          },
        },
      },
    });
  }

  findById(id) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data) {
    return this.prisma.user.create({ data });
  }

  listForActor(actor) {
    const isAdmin = actor?.role === 'ADMIN';
    const actorId = actor?.id;
    const clinicId = actor?.clinicId;

    const where = isAdmin
      ? {
          clinicMemberships: {
            some: {
              clinic: {
                members: {
                  some: { userId: actorId },
                },
              },
            },
          },
        }
      : clinicId
        ? {
            clinicMemberships: {
              some: { clinicId },
            },
          }
        : undefined;

    return this.prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
