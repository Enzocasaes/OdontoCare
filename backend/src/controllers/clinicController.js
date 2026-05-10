import { asyncHandler } from '../utils/asyncHandler.js';

export class ClinicController {
  constructor({ clinicService }) {
    this.clinicService = clinicService;
  }

  create = asyncHandler(async (req, res) => {
    const clinic = await this.clinicService.createClinic(req.body, req.user);
    res.status(201).json(clinic);
  });

  mine = asyncHandler(async (req, res) => {
    const clinics = await this.clinicService.listClinics(req.user);
    res.json(clinics);
  });

  update = asyncHandler(async (req, res) => {
    const clinic = await this.clinicService.updateClinic(req.params.clinicId, req.body, req.user);
    res.json(clinic);
  });

  delete = asyncHandler(async (req, res) => {
    await this.clinicService.deleteClinic(req.params.clinicId, req.user);
    res.status(204).send();
  });

  addMember = asyncHandler(async (req, res) => {
    const member = await this.clinicService.addMember(req.params.clinicId, req.body, req.user);
    res.status(201).json(member);
  });
}