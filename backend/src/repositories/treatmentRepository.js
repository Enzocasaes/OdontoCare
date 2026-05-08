export class TreatmentRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  create(data) {
    return this.prisma.treatment.create({
      data,
      include: {
        patient: true,
        payments: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });
  }

  findById(id) {
    return this.prisma.treatment.findUnique({
      where: { id },
      include: {
        patient: true,
        payments: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });
  }

  findByPatient(patientId, filters = {}) {
    const where = { patientId };
    if (filters.status) where.status = filters.status;

    return this.prisma.treatment.findMany({
      where,
      include: {
        payments: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  list(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.patientId) where.patientId = filters.patientId;

    return this.prisma.treatment.findMany({
      where,
      include: {
        patient: true,
        payments: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id, data) {
    return this.prisma.treatment.update({
      where: { id },
      data,
      include: {
        patient: true,
        payments: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });
  }

  delete(id) {
    return this.prisma.treatment.delete({
      where: { id },
    });
  }

  async getPatientFinancialSummary(patientId) {
    const treatments = await this.prisma.treatment.findMany({
      where: { patientId },
      include: {
        payments: true,
      },
    });

    const summary = {
      totalTreatments: treatments.length,
      totalAmount: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      treatments: [],
    };

    for (const treatment of treatments) {
      const treatmentAmount = parseFloat(treatment.totalAmount);
      const paidAmount = treatment.payments
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const pendingAmount = treatment.payments
        .filter((p) => p.status === 'PENDING')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const overdueAmount = treatment.payments
        .filter((p) => p.status === 'PENDING' && new Date(p.dueDate) < new Date())
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      summary.totalAmount += treatmentAmount;
      summary.totalPaid += paidAmount;
      summary.totalPending += pendingAmount;
      summary.totalOverdue += overdueAmount;

      summary.treatments.push({
        id: treatment.id,
        description: treatment.description,
        totalAmount: treatmentAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
        status: treatment.status,
        totalInstallments: treatment.payments.length,
        paidInstallments: treatment.payments.filter((p) => p.status === 'PAID').length,
        startDate: treatment.startDate,
      });
    }

    return summary;
  }
}
