export class PaymentRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create(data) {
    return this.prisma.payment.create({ data, include: { patient: true, appointment: true } });
  }

  updateStatus(id, status, paidAt = null) {
    return this.prisma.payment.update({
      where: { id },
      data: { status, paidAt },
      include: { patient: true },
    });
  }

  list() {
    return this.prisma.payment.findMany({
      include: { patient: true },
      orderBy: { dueDate: 'asc' },
    });
  }
}
