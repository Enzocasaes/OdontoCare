import { asyncHandler } from '../utils/asyncHandler.js';

export class PatientController {
  constructor({ patientService }) {
    this.patientService = patientService;
  }

  create = asyncHandler(async (req, res) => {
    const patient = await this.patientService.createPatient(req.body, req.user?.id);
    res.status(201).json(patient);
  });

  list = asyncHandler(async (req, res) => {
    const patients = await this.patientService.listPatients(req.query.search || '');
    res.json(patients);
  });

  update = asyncHandler(async (req, res) => {
    const patient = await this.patientService.updatePatient(req.params.id, req.body, req.user?.id);
    res.json(patient);
  });

  details = asyncHandler(async (req, res) => {
    const patient = await this.patientService.getPatientDetails(req.params.id);
    res.json(patient);
  });
}
