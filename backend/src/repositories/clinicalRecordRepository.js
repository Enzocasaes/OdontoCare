import { prisma } from '../config/prisma.js';

export class ClinicalRecordRepository {
  async create(data) {
    return await prisma.clinicalRecord.create({
      data,
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
        appointment: {
          select: { id: true, startAt: true },
        },
      },
    });
  }

  async findById(id, clinicId) {
    return await prisma.clinicalRecord.findFirst({
      where: { id, clinicId },
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
        appointment: {
          select: { id: true, startAt: true },
        },
      },
    });
  }

  async findByPatientId(patientId, clinicId) {
    return await prisma.clinicalRecord.findMany({
      where: { patientId, clinicId },
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
        appointment: {
          select: { id: true, startAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByAppointmentId(appointmentId, clinicId) {
    return await prisma.clinicalRecord.findFirst({
      where: { appointmentId, clinicId },
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(id, clinicId, data) {
    const record = await prisma.clinicalRecord.findFirst({ where: { id, clinicId } });

    if (!record) {
      return null;
    }

    return await prisma.clinicalRecord.update({
      where: { id },
      data,
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
        appointment: {
          select: { id: true, startAt: true },
        },
      },
    });
  }

  async delete(id, clinicId) {
    const record = await prisma.clinicalRecord.findFirst({ where: { id, clinicId } });

    if (!record) {
      return null;
    }

    return await prisma.clinicalRecord.delete({
      where: { id },
    });
  }

  async findByPatientIdPaginated(patientId, clinicId, skip = 0, take = 10) {
    const records = await prisma.clinicalRecord.findMany({
      where: { patientId, clinicId },
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
        appointment: {
          select: { id: true, startAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const total = await prisma.clinicalRecord.count({
      where: { patientId, clinicId },
    });

    return { records, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }
}
