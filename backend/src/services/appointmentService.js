import { ApiError } from '../utils/apiError.js';

export class AppointmentService {
  constructor({ appointmentRepository, paymentRepository, activityLogRepository }) {
    this.appointmentRepository = appointmentRepository;
    this.paymentRepository = paymentRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async createAppointment(payload, clinicId, actorId) {
    if (new Date(payload.startAt) >= new Date(payload.endAt)) {
      throw new ApiError(400, 'Horário de início deve ser anterior ao horário de término');
    }

    const appointmentData = { ...payload };
    delete appointmentData.amount;
    const appointment = await this.appointmentRepository.create({
      ...appointmentData,
      clinicId,
    });

    if (actorId) {
      await this.activityLogRepository.create({
        clinicId,
        userId: actorId,
        action: 'APPOINTMENT_CREATED',
        entity: 'Appointment',
        entityId: appointment.id,
        metadata: { status: appointment.status, amount: amount || null },
      });
    }

    return appointment;
  }

  async updateStatus(id, status, clinicId, actorId) {
    const appointment = await this.appointmentRepository.update(id, clinicId, { status });

    if (!appointment) {
      throw new ApiError(404, 'Agendamento não encontrado');
    }

    if (actorId) {
      await this.activityLogRepository.create({
        clinicId,
        userId: actorId,
        action: 'APPOINTMENT_STATUS_UPDATED',
        entity: 'Appointment',
        entityId: appointment.id,
        metadata: { status },
      });
    }

    return appointment;
  }

  listByPeriod(startAt, endAt, clinicId) {
    return this.appointmentRepository.listByPeriod(new Date(startAt), new Date(endAt), clinicId);
  }

  listToday(clinicId) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.appointmentRepository.listToday(start, end, clinicId);
  }

  getById(id, clinicId) {
    return this.appointmentRepository.getById(id, clinicId);
  }
}
