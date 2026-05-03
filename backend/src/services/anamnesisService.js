import { ApiError } from '../utils/apiError.js';

export class AnamnesisService {
  constructor({ anamnesisRepository, activityLogRepository }) {
    this.anamnesisRepository = anamnesisRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async createVersion(payload, actorId) {
    const anamnesis = await this.anamnesisRepository.createVersion({
      ...payload,
      createdById: actorId || null,
    });

    if (actorId) {
      await this.activityLogRepository.create({
        userId: actorId,
        action: 'ANAMNESIS_VERSION_CREATED',
        entity: 'Anamnesis',
        entityId: anamnesis.id,
        metadata: { patientId: payload.patientId, version: anamnesis.version },
      });
    }

    return anamnesis;
  }

  listByPatient(patientId) {
    return this.anamnesisRepository.listByPatient(patientId);
  }

  async updateById(id, payload, actorId) {
    const anamnesis = await this.anamnesisRepository.findById(id);

    if (!anamnesis) {
      throw new ApiError(404, 'Anamnese não encontrada');
    }

    const updatedAnamnesis = await this.anamnesisRepository.update(id, payload);

    if (actorId) {
      await this.activityLogRepository.create({
        userId: actorId,
        action: 'ANAMNESIS_UPDATED',
        entity: 'Anamnesis',
        entityId: id,
        metadata: { patientId: anamnesis.patientId, version: anamnesis.version },
      });
    }

    return updatedAnamnesis;
  }

  async deleteById(id, actorId) {
    const anamnesis = await this.anamnesisRepository.findById(id);

    if (!anamnesis) {
      throw new ApiError(404, 'Anamnese não encontrada');
    }

    await this.anamnesisRepository.delete(id);

    if (actorId) {
      await this.activityLogRepository.create({
        userId: actorId,
        action: 'ANAMNESIS_DELETED',
        entity: 'Anamnesis',
        entityId: id,
        metadata: { patientId: anamnesis.patientId, version: anamnesis.version },
      });
    }

    return anamnesis;
  }
}
