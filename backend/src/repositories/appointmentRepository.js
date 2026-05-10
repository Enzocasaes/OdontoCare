export class AppointmentRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create(data) {
    return this.prisma.appointment.create({ data, include: { patient: true, dentist: true } });
  }

  async update(id, clinicId, data) {
    const appointment = await this.prisma.appointment.findFirst({ where: { id, clinicId } });

    if (!appointment) {
      return null;
    }

    return this.prisma.appointment.update({ where: { id }, data, include: { patient: true, dentist: true } });
  }

  listByPeriod(startAt, endAt, clinicId) {
    return this.prisma.appointment.findMany({
      where: { clinicId, startAt: { gte: startAt, lte: endAt } },
      include: { patient: true, dentist: true },
      orderBy: { startAt: 'asc' },
    });
  }

  listToday(startAt, endAt, clinicId) {
    return this.listByPeriod(startAt, endAt, clinicId);
  }

  getById(id, clinicId) {
    return this.prisma.appointment.findFirst({
      where: { id, clinicId },
      include: { patient: true, dentist: true, payment: true },
    });
  }
}
