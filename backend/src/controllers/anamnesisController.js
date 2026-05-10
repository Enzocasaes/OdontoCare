import { asyncHandler } from '../utils/asyncHandler.js';

export class AnamnesisController {
  constructor({ anamnesisService }) {
    this.anamnesisService = anamnesisService;
  }

  create = asyncHandler(async (req, res) => {
    const anamnesis = await this.anamnesisService.createVersion(req.body, req.user?.clinicId, req.user);
    res.status(201).json(anamnesis);
  });

  listByPatient = asyncHandler(async (req, res) => {
    const anamneses = await this.anamnesisService.listByPatient(req.params.patientId, req.user?.clinicId);
    res.json(anamneses);
  });

  update = asyncHandler(async (req, res) => {
    const anamnesis = await this.anamnesisService.updateById(req.params.id, req.body, req.user?.clinicId, req.user);
    res.json(anamnesis);
  });

  delete = asyncHandler(async (req, res) => {
    await this.anamnesisService.deleteById(req.params.id, req.user?.clinicId, req.user);
    res.json({ message: 'Anamnese removida com sucesso' });
  });
}
