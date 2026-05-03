import { Router } from 'express';
import multer from 'multer';
import { validate } from '../middlewares/validateMiddleware.js';
import {
  uploadAttachmentSchema,
  updateAttachmentSchema,
} from '../schemas/attachmentSchemas.js';

// Configuração do multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'image/tiff',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
    }
  },
});

export function createAttachmentRoutes(container) {
  const router = Router();
  const attachmentController = container.get('attachmentController');

  // Upload de arquivo
  router.post(
    '/patient/:patientId',
    upload.single('file'),
    validate(uploadAttachmentSchema),
    attachmentController.upload
  );

  // Listar anexos do paciente
  router.get('/patient/:patientId', attachmentController.getByPatient);

  // Listar anexos por categoria
  router.get('/patient/:patientId/category/:category', attachmentController.getByCategory);

  // Listar anexos de uma ficha clínica
  router.get('/clinical-record/:clinicalRecordId', attachmentController.getByClinicalRecord);

  // Download de arquivo
  router.get('/:attachmentId/download', attachmentController.download);

  // Visualizar arquivo
  router.get('/:attachmentId/view', attachmentController.view);

  // Atualizar informações do arquivo
  router.patch(
    '/:id',
    validate(updateAttachmentSchema),
    attachmentController.update
  );

  // Deletar arquivo
  router.delete(
    '/:id',
    attachmentController.delete
  );

  return router;
}
