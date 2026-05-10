import { ApiError } from '../utils/apiError.js';

export class AnamnesisService {
  constructor({ anamnesisRepository, activityLogRepository }) {
    this.anamnesisRepository = anamnesisRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async createVersion(payload, clinicId, actor) {
    const anamnesis = await this.anamnesisRepository.createVersion({
      ...payload,
      clinicId,
      createdById: actor?.id || null,
    });

    if (actor?.id) {
      await this.activityLogRepository.create({
        clinicId,
        userId: actor.id,
        action: 'ANAMNESIS_VERSION_CREATED',
        entity: 'Anamnesis',
        entityId: anamnesis.id,
        metadata: { patientId: payload.patientId, version: anamnesis.version },
      });
    }

    return anamnesis;
  }

  listByPatient(patientId, clinicId) {
    return this.anamnesisRepository.listByPatient(patientId, clinicId);
  }

  async updateById(id, payload, clinicId, actor) {
    const anamnesis = await this.anamnesisRepository.findById(id, clinicId);

    if (!anamnesis) {
      throw new ApiError(404, 'Anamnese não encontrada');
    }

    const updatedAnamnesis = await this.anamnesisRepository.update(id, clinicId, payload);

    if (actor?.id) {
      await this.activityLogRepository.create({
        clinicId,
        userId: actor.id,
        action: 'ANAMNESIS_UPDATED',
        entity: 'Anamnesis',
        entityId: id,
        metadata: { patientId: anamnesis.patientId, version: anamnesis.version },
      });
    }

    return updatedAnamnesis;
  }

  async deleteById(id, clinicId, actor) {
    const anamnesis = await this.anamnesisRepository.findById(id, clinicId);

    if (!anamnesis) {
      throw new ApiError(404, 'Anamnese não encontrada');
    }

    await this.anamnesisRepository.delete(id, clinicId);

    if (actor?.id) {
      await this.activityLogRepository.create({
        clinicId,
        userId: actor.id,
        action: 'ANAMNESIS_DELETED',
        entity: 'Anamnesis',
        entityId: id,
        metadata: { patientId: anamnesis.patientId, version: anamnesis.version },
      });
    }

    return anamnesis;
  }
}
