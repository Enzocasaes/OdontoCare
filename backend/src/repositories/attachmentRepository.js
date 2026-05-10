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

  async findById(id, clinicId) {
    return await prisma.attachment.findFirst({
      where: { id, clinicId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findByPatientId(patientId, clinicId) {
    return await prisma.attachment.findMany({
      where: { patientId, clinicId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPatientIdPaginated(patientId, clinicId, skip = 0, take = 10) {
    const attachments = await prisma.attachment.findMany({
      where: { patientId, clinicId },
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
      where: { patientId, clinicId },
    });

    return { attachments, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findByClinicalRecordId(clinicalRecordId, clinicId) {
    return await prisma.attachment.findMany({
      where: { clinicalRecordId, clinicId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCategory(patientId, clinicId, category) {
    return await prisma.attachment.findMany({
      where: {
        patientId,
        clinicId,
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

  async update(id, clinicId, data) {
    const attachment = await prisma.attachment.findFirst({ where: { id, clinicId } });

    if (!attachment) {
      return null;
    }

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

  async delete(id, clinicId) {
    const attachment = await prisma.attachment.findFirst({ where: { id, clinicId } });

    if (!attachment) {
      return null;
    }

    return await prisma.attachment.delete({
      where: { id },
    });
  }

  async deleteByPatientId(patientId, clinicId) {
    return await prisma.attachment.deleteMany({
      where: { patientId, clinicId },
    });
  }

  async countByPatient(patientId, clinicId) {
    return await prisma.attachment.count({
      where: { patientId, clinicId },
    });
  }

  async getTotalSizeByPatient(patientId, clinicId) {
    const result = await prisma.attachment.aggregate({
      where: { patientId, clinicId },
      _sum: { fileSize: true },
    });
    return result._sum.fileSize || 0;
  }
}
