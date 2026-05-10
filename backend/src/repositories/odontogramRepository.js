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

  async findByPatientId(patientId, clinicId) {
    return await prisma.odontogram.findFirst({
      where: { patientId, clinicId },
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findById(id, clinicId) {
    return await prisma.odontogram.findFirst({
      where: { id, clinicId },
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(patientId, clinicId, data) {
    const odontogram = await prisma.odontogram.findFirst({ where: { patientId, clinicId } });

    if (!odontogram) {
      return null;
    }

    return await prisma.odontogram.update({
      where: { id: odontogram.id },
      data,
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async deleteByPatientId(patientId, clinicId) {
    const odontogram = await prisma.odontogram.findFirst({ where: { patientId, clinicId } });

    if (!odontogram) {
      return null;
    }

    return await prisma.odontogram.delete({
      where: { id: odontogram.id },
    });
  }

  async existsByPatientId(patientId, clinicId) {
    const count = await prisma.odontogram.count({
      where: { patientId, clinicId },
    });
    return count > 0;
  }

  async getTeethData(patientId, clinicId) {
    const odontogram = await prisma.odontogram.findFirst({
      where: { patientId, clinicId },
      select: { teeth: true },
    });
    return odontogram?.teeth || null;
  }

  async updateTeethData(patientId, clinicId, teethData) {
    const odontogram = await prisma.odontogram.findFirst({ where: { patientId, clinicId } });

    if (!odontogram) {
      return null;
    }

    return await prisma.odontogram.update({
      where: { id: odontogram.id },
      data: { teeth: teethData },
      include: {
        dentist: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
