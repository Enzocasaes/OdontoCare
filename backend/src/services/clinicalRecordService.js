import { ApiError } from '../utils/apiError.js';

export class ClinicalRecordService {
  constructor({ clinicalRecordRepository }) {
    this.clinicalRecordRepository = clinicalRecordRepository;
  }

  async createRecord(data, clinicId, actor) {
    if (!data.patientId || !data.procedures || !data.diagnosis) {
      throw new ApiError(400, 'Dados obrigatórios faltando: patientId, procedures, diagnosis');
    }

    return await this.clinicalRecordRepository.create({
      ...data,
      clinicId,
      dentistId: actor?.id || null,
    });
  }

  async getRecordById(recordId, clinicId) {
    const record = await this.clinicalRecordRepository.findById(recordId, clinicId);
    if (!record) {
      throw new ApiError(404, 'Ficha clínica não encontrada');
    }
    return record;
  }

  async listByPatient(patientId, clinicId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await this.clinicalRecordRepository.findByPatientIdPaginated(patientId, clinicId, skip, limit);
  }

  async updateRecord(recordId, data, clinicId, actor) {
    const record = await this.getRecordById(recordId, clinicId);

    if (actor && record.dentistId && record.dentistId !== actor.id && actor.role !== 'ADMIN') {
      throw new ApiError(403, 'Você não tem permissão para atualizar este registro');
    }

    return await this.clinicalRecordRepository.update(recordId, clinicId, data);
  }

  async deleteRecord(recordId, clinicId, actor) {
    const record = await this.getRecordById(recordId, clinicId);

    if (actor && record.dentistId && record.dentistId !== actor.id && actor.role !== 'ADMIN') {
      throw new ApiError(403, 'Você não tem permissão para deletar este registro');
    }

    return await this.clinicalRecordRepository.delete(recordId, clinicId);
  }

  async getLatestByPatient(patientId, clinicId) {
    const records = await this.clinicalRecordRepository.findByPatientId(patientId, clinicId);
    return records.length > 0 ? records[0] : null;
  }
}
