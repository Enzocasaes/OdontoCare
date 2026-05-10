export class ActivityLogRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create(data) {
    return this.prisma.activityLog.create({ data });
  }

  list(limit = 100, clinicId) {
    return this.prisma.activityLog.findMany({
      where: clinicId ? { clinicId } : undefined,
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
