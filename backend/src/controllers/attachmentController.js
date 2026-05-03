import { asyncHandler } from '../utils/asyncHandler.js';
import fs from 'fs/promises';

export class AttachmentController {
  constructor({ attachmentService }) {
    this.attachmentService = attachmentService;
  }

  upload = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const { category = 'outro', description = '', clinicalRecordId } = req.body;

    const attachment = await this.attachmentService.uploadFile(
      req.file,
      patientId,
      req.user?.id,
      category,
      description,
      clinicalRecordId
    );

    res.status(201).json(attachment);
  });

  getByPatient = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const attachments = await this.attachmentService.getAttachmentsByPatient(
      req.params.patientId,
      page,
      limit
    );
    res.json(attachments);
  });

  getByCategory = asyncHandler(async (req, res) => {
    const attachments = await this.attachmentService.getAttachmentsByCategory(
      req.params.patientId,
      req.params.category
    );
    res.json(attachments);
  });

  getByClinicalRecord = asyncHandler(async (req, res) => {
    const attachments = await this.attachmentService.getAttachmentByClinicalRecord(
      req.params.clinicalRecordId
    );
    res.json(attachments);
  });

  download = asyncHandler(async (req, res) => {
    const { attachmentId } = req.params;
    const attachment = await this.attachmentService.attachmentRepository.findById(attachmentId);

    if (!attachment) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    try {
      const fileContent = await fs.readFile(attachment.filePath);
      res.setHeader('Content-Type', attachment.fileType);
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
      res.send(fileContent);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao baixar arquivo' });
    }
  });

  view = asyncHandler(async (req, res) => {
    const { attachmentId } = req.params;
    const attachment = await this.attachmentService.attachmentRepository.findById(attachmentId);

    if (!attachment) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    try {
      const fileContent = await fs.readFile(attachment.filePath);
      res.setHeader('Content-Type', attachment.fileType);
      res.setHeader('Content-Disposition', `inline; filename="${attachment.originalName}"`);
      res.send(fileContent);
    } catch (err) {
      res.status(500).json({ message: 'Erro ao visualizar arquivo' });
    }
  });

  update = asyncHandler(async (req, res) => {
    const { category, description } = req.body;
    const attachment = await this.attachmentService.updateAttachmentInfo(
      req.params.id,
      { category, description },
      req.user?.id
    );
    res.json(attachment);
  });

  delete = asyncHandler(async (req, res) => {
    await this.attachmentService.deleteFile(req.params.id, req.user?.id);
    res.json({ message: 'Arquivo deletado com sucesso' });
  });
}
