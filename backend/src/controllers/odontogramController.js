import { asyncHandler } from '../utils/asyncHandler.js';

export class OdontogramController {
  constructor({ odontogramService }) {
    this.odontogramService = odontogramService;
  }

  create = asyncHandler(async (req, res) => {
    const { teeth, observations } = req.body;
    const odontogram = await this.odontogramService.createOdontogram(
      req.params.patientId,
      req.user?.id,
      teeth,
      observations
    );
    res.status(201).json(odontogram);
  });

  getByPatient = asyncHandler(async (req, res) => {
    const odontogram = await this.odontogramService.getOdontogram(req.params.patientId);
    res.json(odontogram);
  });

  update = asyncHandler(async (req, res) => {
    const odontogram = await this.odontogramService.updateOdontogram(
      req.params.patientId,
      req.body,
      req.user?.id
    );
    res.json(odontogram);
  });

  updateTooth = asyncHandler(async (req, res) => {
    const { toothNumber } = req.params;
    const { status, notes } = req.body;
    const odontogram = await this.odontogramService.updateToothData(
      req.params.patientId,
      toothNumber,
      { status, notes },
      req.user?.id
    );
    res.json(odontogram);
  });

  delete = asyncHandler(async (req, res) => {
    await this.odontogramService.deleteOdontogram(req.params.patientId, req.user?.id);
    res.json({ message: 'Odontograma deletado com sucesso' });
  });
}
