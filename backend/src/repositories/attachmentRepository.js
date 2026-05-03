import { prisma } from '../config/prisma.js';

export class AttachmentRepository {
  async create(data) {
    return await prisma.attachment.create({
      data,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findById(id) {
    return await prisma.attachment.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findByPatientId(patientId) {
    return await prisma.attachment.findMany({
      where: { patientId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPatientIdPaginated(patientId, skip = 0, take = 10) {
    const attachments = await prisma.attachment.findMany({
      where: { patientId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const total = await prisma.attachment.count({
      where: { patientId },
    });

    return { attachments, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findByClinicalRecordId(clinicalRecordId) {
    return await prisma.attachment.findMany({
      where: { clinicalRecordId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCategory(patientId, category) {
    return await prisma.attachment.findMany({
      where: {
        patientId,
        category,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id, data) {
    return await prisma.attachment.update({
      where: { id },
      data,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async delete(id) {
    return await prisma.attachment.delete({
      where: { id },
    });
  }

  async deleteByPatientId(patientId) {
    return await prisma.attachment.deleteMany({
      where: { patientId },
    });
  }

  async countByPatient(patientId) {
    return await prisma.attachment.count({
      where: { patientId },
    });
  }

  async getTotalSizeByPatient(patientId) {
    const result = await prisma.attachment.aggregate({
      where: { patientId },
      _sum: { fileSize: true },
    });
    return result._sum.fileSize || 0;
  }
}
