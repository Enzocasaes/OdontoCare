import { asyncHandler } from '../utils/asyncHandler.js';

export class AnamnesisController {
  constructor({ anamnesisService }) {
    this.anamnesisService = anamnesisService;
  }

  create = asyncHandler(async (req, res) => {
    const anamnesis = await this.anamnesisService.createVersion(req.body, req.user?.id);
    res.status(201).json(anamnesis);
  });

  listByPatient = asyncHandler(async (req, res) => {
    const anamneses = await this.anamnesisService.listByPatient(req.params.patientId);
    res.json(anamneses);
  });

  update = asyncHandler(async (req, res) => {
    const anamnesis = await this.anamnesisService.updateById(req.params.id, req.body, req.user?.id);
    res.json(anamnesis);
  });

  delete = asyncHandler(async (req, res) => {
    await this.anamnesisService.deleteById(req.params.id, req.user?.id);
    res.json({ message: 'Anamnese removida com sucesso' });
  });
}
