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

  async updateStatus(id, clinicId, status, paidAt = null, method = null) {
    const updateData = { status, paidAt };
    if (method) updateData.method = method;

    const payment = await this.prisma.payment.findFirst({ where: { id, clinicId } });

    if (!payment) {
      return null;
    }

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

  findById(id, clinicId) {
    return this.prisma.payment.findFirst({
      where: { id, clinicId },
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
    if (filters.clinicId) where.clinicId = filters.clinicId;

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

  findByTreatment(treatmentId, clinicId) {
    return this.prisma.payment.findMany({
      where: { treatmentId, clinicId },
      orderBy: { installmentNumber: 'asc' },
    });
  }

  findOverdue(clinicId) {
    return this.prisma.payment.findMany({
      where: {
        clinicId,
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
