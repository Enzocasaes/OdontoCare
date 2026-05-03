import { ApiError } from '../utils/apiError.js';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'image/tiff',
];

export class AttachmentService {
  constructor({ attachmentRepository }) {
    this.attachmentRepository = attachmentRepository;
  }

  async uploadFile(file, patientId, userId, category = 'outro', description = '', clinicalRecordId = null) {
    // Validações
    if (!file) {
      throw new ApiError(400, 'Nenhum arquivo foi enviado');
    }

    if (!this.isAllowedFileType(file.mimetype)) {
      throw new ApiError(400, `Tipo de arquivo não permitido. Use: ${ALLOWED_TYPES.join(', ')}`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(400, `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (!['raio-x', 'foto', 'documento', 'exame', 'outro'].includes(category)) {
      throw new ApiError(400, 'Categoria de arquivo inválida');
    }

    try {
      // Criar diretório se não existir
      await fs.mkdir(UPLOAD_DIR, { recursive: true });

      // Gerar nome único para arquivo
      const fileExtension = this.getFileExtension(file.originalname);
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const filePath = path.join(UPLOAD_DIR, uniqueFileName);

      // Salvar arquivo
      await fs.writeFile(filePath, file.buffer);

      // Salvar referência no banco
      const attachment = await this.attachmentRepository.create({
        patientId,
        clinicalRecordId,
        uploadedById: userId || null,
        fileName: uniqueFileName,
        originalName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        filePath,
        category,
        description: description || null,
      });

      return attachment;
    } catch (err) {
      throw new ApiError(500, 'Erro ao fazer upload do arquivo: ' + err.message);
    }
  }

  async deleteFile(attachmentId, userId) {
    const attachment = await this.attachmentRepository.findById(attachmentId);

    if (!attachment) {
      throw new ApiError(404, 'Arquivo não encontrado');
    }

    if (userId && attachment.uploadedBy?.id && attachment.uploadedBy.id !== userId && userId.role !== 'ADMIN') {
      throw new ApiError(403, 'Você não tem permissão para deletar este arquivo');
    }

    try {
      // Deletar arquivo do disco
      if (attachment.filePath) {
        try {
          await fs.unlink(attachment.filePath);
        } catch (err) {
          console.error('Erro ao deletar arquivo físico:', err);
        }
      }

      // Deletar referência do banco
      return await this.attachmentRepository.delete(attachmentId);
    } catch (err) {
      throw new ApiError(500, 'Erro ao deletar arquivo: ' + err.message);
    }
  }

  async getAttachmentsByPatient(patientId, page = 1, limit = 10) {
    return await this.attachmentRepository.findByPatientIdPaginated(patientId, (page - 1) * limit, limit);
  }

  async getAttachmentsByCategory(patientId, category) {
    if (!['raio-x', 'foto', 'documento', 'exame', 'outro'].includes(category)) {
      throw new ApiError(400, 'Categoria inválida');
    }

    return await this.attachmentRepository.findByCategory(patientId, category);
  }

  async getAttachmentByClinicalRecord(clinicalRecordId) {
    return await this.attachmentRepository.findByClinicalRecordId(clinicalRecordId);
  }

  async updateAttachmentInfo(attachmentId, data, userId) {
    const attachment = await this.attachmentRepository.findById(attachmentId);

    if (!attachment) {
      throw new ApiError(404, 'Arquivo não encontrado');
    }

    if (userId && attachment.uploadedBy?.id && attachment.uploadedBy.id !== userId && userId.role !== 'ADMIN') {
      throw new ApiError(403, 'Você não tem permissão para atualizar este arquivo');
    }

    const updateData = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category) {
      if (!['raio-x', 'foto', 'documento', 'exame', 'outro'].includes(data.category)) {
        throw new ApiError(400, 'Categoria inválida');
      }
      updateData.category = data.category;
    }

    return await this.attachmentRepository.update(attachmentId, updateData);
  }

  isAllowedFileType(mimetype) {
    return ALLOWED_TYPES.includes(mimetype);
  }

  getFileExtension(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    return /^[a-zA-Z0-9]{2,4}$/.test(ext) ? ext : 'bin';
  }
}
