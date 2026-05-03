import { asyncHandler } from '../utils/asyncHandler.js';

export class MedicalRecordController {
  constructor({ medicalRecordService }) {
    this.medicalRecordService = medicalRecordService;
  }

  create = asyncHandler(async (req, res) => {
    const record = await this.medicalRecordService.createRecord(req.body, req.user.id);
    res.status(201).json(record);
  });

  listByPatient = asyncHandler(async (req, res) => {
    const records = await this.medicalRecordService.listByPatient(req.params.patientId);
    res.json(records);
  });
}
