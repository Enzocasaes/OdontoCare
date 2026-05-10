import { ApiError } from '../utils/apiError.js';

const normalizeCnpj = (value) => value.replace(/\D/g, '');

export class ClinicService {
  constructor({ clinicRepository, userRepository, activityLogRepository }) {
    this.clinicRepository = clinicRepository;
    this.userRepository = userRepository;
    this.activityLogRepository = activityLogRepository;
  }

  normalizeClinicPayload(payload) {
    return {
      name: payload.name.trim(),
      address: payload.address.trim(),
      cnpj: normalizeCnpj(payload.cnpj),
    };
  }

  assertAdmin(actor) {
    if (!actor?.id || actor.role !== 'ADMIN') {
      throw new ApiError(403, 'Acesso negado');
    }
  }

  async createClinic(payload, actor) {
    this.assertAdmin(actor);

    const clinicData = this.normalizeClinicPayload(payload);

    const clinic = await this.clinicRepository.create({
      ...clinicData,
    });

    if (actor?.id) {
      await this.clinicRepository.addMember(clinic.id, actor.id);
      await this.activityLogRepository.create({
        clinicId: clinic.id,
        userId: actor.id,
        action: 'CLINIC_CREATED',
        entity: 'Clinic',
        entityId: clinic.id,
        metadata: { name: clinic.name, address: clinic.address, cnpj: clinic.cnpj },
      });
    }

    return clinic;
  }

  async listClinics(actor) {
    this.assertAdmin(actor);
    return this.clinicRepository.findAll();
  }

  async updateClinic(clinicId, payload, actor) {
    this.assertAdmin(actor);

    const clinicData = this.normalizeClinicPayload(payload);

    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new ApiError(404, 'Consultório não encontrado');
    }

    const updatedClinic = await this.clinicRepository.update(clinicId, {
      ...clinicData,
    });

    await this.activityLogRepository.create({
      clinicId: updatedClinic.id,
      userId: actor.id,
      action: 'CLINIC_UPDATED',
      entity: 'Clinic',
      entityId: updatedClinic.id,
      metadata: { name: updatedClinic.name, address: updatedClinic.address, cnpj: updatedClinic.cnpj },
    });

    return updatedClinic;
  }

  async deleteClinic(clinicId, actor) {
    this.assertAdmin(actor);

    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new ApiError(404, 'Consultório não encontrado');
    }

    await this.activityLogRepository.create({
      clinicId,
      userId: actor.id,
      action: 'CLINIC_DELETED',
      entity: 'Clinic',
      entityId: clinicId,
      metadata: { name: clinic.name, address: clinic.address, cnpj: clinic.cnpj },
    });

    const deletedClinic = await this.clinicRepository.delete(clinicId);

    return deletedClinic;
  }

  async addMember(clinicId, payload, actor) {
    this.assertAdmin(actor);

    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new ApiError(404, 'Consultório não encontrado');
    }

    const user = payload.userId
      ? await this.userRepository.findById(payload.userId)
      : await this.userRepository.findByEmail(payload.email);

    if (!user) {
      throw new ApiError(404, 'Usuário não encontrado');
    }

    const existingMember = await this.clinicRepository.findMember(clinicId, user.id);
    if (existingMember) {
      throw new ApiError(409, 'Usuário já pertence a este consultório');
    }

    return this.clinicRepository.addMember(clinicId, user.id);
  }
}