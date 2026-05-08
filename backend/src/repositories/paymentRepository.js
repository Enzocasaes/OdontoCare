export class PaymentRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create(data) {
    return this.prisma.payment.create({
      data,
      include: {
        treatment: {
          include: {
            patient: true,
          },
        },
      },
    });
  }

  updateStatus(id, status, paidAt = null, method = null) {
    const updateData = { status, paidAt };
    if (method) updateData.method = method;

    return this.prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        treatment: {
          include: {
            patient: true,
          },
        },
      },
    });
  }

  findById(id) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        treatment: {
          include: {
            patient: true,
          },
        },
      },
    });
  }

  list(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.treatmentId) where.treatmentId = filters.treatmentId;

    return this.prisma.payment.findMany({
      where,
      include: {
        treatment: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  findByTreatment(treatmentId) {
    return this.prisma.payment.findMany({
      where: { treatmentId },
      orderBy: { installmentNumber: 'asc' },
    });
  }

  findOverdue() {
    return this.prisma.payment.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        treatment: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
