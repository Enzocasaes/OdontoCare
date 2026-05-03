export class AppointmentRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create(data) {
    return this.prisma.appointment.create({ data, include: { patient: true, dentist: true } });
  }

  update(id, data) {
    return this.prisma.appointment.update({ where: { id }, data, include: { patient: true, dentist: true } });
  }

  listByPeriod(startAt, endAt) {
    return this.prisma.appointment.findMany({
      where: { startAt: { gte: startAt, lte: endAt } },
      include: { patient: true, dentist: true },
      orderBy: { startAt: 'asc' },
    });
  }

  listToday(startAt, endAt) {
    return this.listByPeriod(startAt, endAt);
  }

  getById(id) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, dentist: true, payment: true },
    });
  }
}
