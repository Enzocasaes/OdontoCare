import { ApiError } from '../utils/apiError.js';

export class ClinicalRecordService {
  constructor({ clinicalRecordRepository }) {
    this.clinicalRecordRepository = clinicalRecordRepository;
  }

  async createRecord(data, userId) {
    if (!data.patientId || !data.procedures || !data.diagnosis) {
      throw new ApiError(400, 'Dados obrigatórios faltando: patientId, procedures, diagnosis');
    }

    return await this.clinicalRecordRepository.create({
      ...data,
      dentistId: userId || null,
    });
  }

  async getRecordById(recordId) {
    const record = await this.clinicalRecordRepository.findById(recordId);
    if (!record) {
      throw new ApiError(404, 'Ficha clínica não encontrada');
    }
    return record;
  }

  async listByPatient(patientId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await this.clinicalRecordRepository.findByPatientIdPaginated(patientId, skip, limit);
  }

  async updateRecord(recordId, data, userId) {
    const record = await this.getRecordById(recordId);

    if (userId && record.dentistId && record.dentistId !== userId && userId.role !== 'ADMIN') {
      throw new ApiError(403, 'Você não tem permissão para atualizar este registro');
    }

    return await this.clinicalRecordRepository.update(recordId, data);
  }

  async deleteRecord(recordId, userId) {
    const record = await this.getRecordById(recordId);

    if (userId && record.dentistId && record.dentistId !== userId && userId.role !== 'ADMIN') {
      throw new ApiError(403, 'Você não tem permissão para deletar este registro');
    }

    return await this.clinicalRecordRepository.delete(recordId);
  }

  async getLatestByPatient(patientId) {
    const records = await this.clinicalRecordRepository.findByPatientId(patientId);
    return records.length > 0 ? records[0] : null;
  }
}
