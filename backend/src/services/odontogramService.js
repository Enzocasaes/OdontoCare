import { ApiError } from '../utils/apiError.js';

export class OdontogramService {
  constructor({ odontogramRepository }) {
    this.odontogramRepository = odontogramRepository;
  }

  async createOdontogram(patientId, userId, teeth = null, observations = '') {
    const exists = await this.odontogramRepository.existsByPatientId(patientId);
    if (exists) {
      throw new ApiError(409, 'Este paciente já possui um odontograma');
    }

    // Inicializar dentes padrão (32 dentes permanentes)
    const defaultTeeth = teeth || this.getDefaultTeethStructure();

    return await this.odontogramRepository.create({
      patientId,
      dentistId: userId || null,
      teeth: defaultTeeth,
      observations,
    });
  }

  getDefaultTeethStructure() {
    // Estrutura padrão para 32 dentes permanentes
    const teeth = {};
    
    // Números de dentes conforme nomenclatura odontológica FDI
    // Superior: 11-18 (direita para esquerda), 21-28 (esquerda para direita)
    // Inferior: 31-38 (esquerda para direita), 41-48 (direita para esquerda)
    const toothNumbers = [
      11, 12, 13, 14, 15, 16, 17, 18,
      21, 22, 23, 24, 25, 26, 27, 28,
      31, 32, 33, 34, 35, 36, 37, 38,
      41, 42, 43, 44, 45, 46, 47, 48,
    ];

    toothNumbers.forEach(num => {
      teeth[num] = {
        number: num,
        status: 'healthy', // healthy, caries, missing, restored, root
        notes: '',
      };
    });

    return teeth;
  }

  async getOdontogram(patientId) {
    const odontogram = await this.odontogramRepository.findByPatientId(patientId);
    return odontogram;
  }

  async updateOdontogram(patientId, data, userId) {
    let odontogram = await this.odontogramRepository.findByPatientId(patientId);
    
    if (!odontogram) {
      throw new ApiError(404, 'Odontograma não encontrado');
    }

    if (userId && odontogram.dentistId && odontogram.dentistId !== userId && userId.role !== 'ADMIN') {
      throw new ApiError(403, 'Você não tem permissão para atualizar este odontograma');
    }

    return await this.odontogramRepository.update(patientId, data);
  }

  async updateToothData(patientId, toothNumber, toothData, userId) {
    const odontogram = await this.odontogramRepository.findByPatientId(patientId);
    
    if (!odontogram) {
      throw new ApiError(404, 'Odontograma não encontrado');
    }

    if (userId && odontogram.dentistId && odontogram.dentistId !== userId && userId.role !== 'ADMIN') {
      throw new ApiError(403, 'Você não tem permissão para atualizar este odontograma');
    }

    const teeth = odontogram.teeth || {};
    teeth[toothNumber] = {
      ...teeth[toothNumber],
      ...toothData,
      number: toothNumber,
    };

    return await this.odontogramRepository.updateTeethData(patientId, teeth);
  }

  async deleteOdontogram(patientId, userId) {
    const odontogram = await this.odontogramRepository.findByPatientId(patientId);
    
    if (!odontogram) {
      throw new ApiError(404, 'Odontograma não encontrado');
    }

    if (userId && odontogram.dentistId && odontogram.dentistId !== userId && userId.role !== 'ADMIN') {
      throw new ApiError(403, 'Você não tem permissão para deletar este odontograma');
    }

    return await this.odontogramRepository.deleteByPatientId(patientId);
  }

  getToothStatusLabel(status) {
    const statusMap = {
      healthy: 'Hígido',
      caries: 'Cárie',
      missing: 'Ausente',
      restored: 'Restaurado',
      root: 'Raiz',
    };
    return statusMap[status] || status;
  }
}
