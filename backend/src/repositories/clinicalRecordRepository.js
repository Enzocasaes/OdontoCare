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

  async findById(id) {
    return await prisma.clinicalRecord.findUnique({
      where: { id },
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

  async findByPatientId(patientId) {
    return await prisma.clinicalRecord.findMany({
      where: { patientId },
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

  async findByAppointmentId(appointmentId) {
    return await prisma.clinicalRecord.findUnique({
      where: { appointmentId },
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(id, data) {
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

  async delete(id) {
    return await prisma.clinicalRecord.delete({
      where: { id },
    });
  }

  async findByPatientIdPaginated(patientId, skip = 0, take = 10) {
    const records = await prisma.clinicalRecord.findMany({
      where: { patientId },
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
      where: { patientId },
    });

    return { records, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }
}
