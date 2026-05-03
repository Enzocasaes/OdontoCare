import { prisma } from '../config/prisma.js';

export class OdontogramRepository {
  async create(data) {
    return await prisma.odontogram.create({
      data,
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findByPatientId(patientId) {
    return await prisma.odontogram.findUnique({
      where: { patientId },
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findById(id) {
    return await prisma.odontogram.findUnique({
      where: { id },
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(patientId, data) {
    return await prisma.odontogram.update({
      where: { patientId },
      data,
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async deleteByPatientId(patientId) {
    return await prisma.odontogram.delete({
      where: { patientId },
    });
  }

  async existsByPatientId(patientId) {
    const count = await prisma.odontogram.count({
      where: { patientId },
    });
    return count > 0;
  }

  async getTeethData(patientId) {
    const odontogram = await prisma.odontogram.findUnique({
      where: { patientId },
      select: { teeth: true },
    });
    return odontogram?.teeth || null;
  }

  async updateTeethData(patientId, teethData) {
    return await prisma.odontogram.update({
      where: { patientId },
      data: { teeth: teethData },
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
