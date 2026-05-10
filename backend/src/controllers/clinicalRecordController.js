import { asyncHandler } from '../utils/asyncHandler.js';

export class ClinicalRecordController {
  constructor({ clinicalRecordService }) {
    this.clinicalRecordService = clinicalRecordService;
  }

  create = asyncHandler(async (req, res) => {
    const record = await this.clinicalRecordService.createRecord(req.body, req.user?.clinicId, req.user);
    res.status(201).json(record);
  });

  getById = asyncHandler(async (req, res) => {
    const record = await this.clinicalRecordService.getRecordById(req.params.id, req.user?.clinicId);
    res.json(record);
  });

  listByPatient = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const records = await this.clinicalRecordService.listByPatient(
      req.params.patientId,
      req.user?.clinicId,
      page,
      limit
    );
    res.json(records);
  });

  update = asyncHandler(async (req, res) => {
    const record = await this.clinicalRecordService.updateRecord(
      req.params.id,
      req.body,
      req.user?.clinicId,
      req.user
    );
    res.json(record);
  });

  delete = asyncHandler(async (req, res) => {
    await this.clinicalRecordService.deleteRecord(req.params.id, req.user?.clinicId, req.user);
    res.json({ message: 'Ficha clínica deletada com sucesso' });
  });

  getLatest = asyncHandler(async (req, res) => {
    const record = await this.clinicalRecordService.getLatestByPatient(
      req.params.patientId,
      req.user?.clinicId
    );
    res.json(record);
  });
}
