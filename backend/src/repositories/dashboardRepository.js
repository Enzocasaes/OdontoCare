export class DashboardRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async kpis(startAt, endAt, clinicId) {
    const where = clinicId ? { clinicId } : {};

    const [appointmentsToday, confirmed, completed, pendingPayments, revenue] = await Promise.all([
      this.prisma.appointment.count({ where: { ...where, startAt: { gte: startAt, lte: endAt } } }),
      this.prisma.appointment.count({ where: { ...where, startAt: { gte: startAt, lte: endAt }, status: 'CONFIRMED' } }),
      this.prisma.appointment.count({ where: { ...where, startAt: { gte: startAt, lte: endAt }, status: 'COMPLETED' } }),
      this.prisma.payment.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { ...where, status: 'PAID' } }),
    ]);

    return {
      appointmentsToday,
      confirmed,
      completed,
      pendingPayments,
      revenue: Number(revenue._sum.amount || 0),
    };
  }
}
