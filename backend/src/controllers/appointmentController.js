import { asyncHandler } from '../utils/asyncHandler.js';

export class AppointmentController {
  constructor({ appointmentService }) {
    this.appointmentService = appointmentService;
  }

  create = asyncHandler(async (req, res) => {
    const appointment = await this.appointmentService.createAppointment(req.body, req.user?.id);
    res.status(201).json(appointment);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const appointment = await this.appointmentService.updateStatus(req.params.id, req.body.status, req.user?.id);
    res.json(appointment);
  });

  listByPeriod = asyncHandler(async (req, res) => {
    const appointments = await this.appointmentService.listByPeriod(req.query.startAt, req.query.endAt);
    res.json(appointments);
  });

  listToday = asyncHandler(async (_req, res) => {
    const appointments = await this.appointmentService.listToday();
    res.json(appointments);
  });

  getById = asyncHandler(async (req, res) => {
    const appointment = await this.appointmentService.getById(req.params.id);
    res.json(appointment);
  });
}
