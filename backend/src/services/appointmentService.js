import { ApiError } from '../utils/apiError.js';

export class AppointmentService {
  constructor({ appointmentRepository, paymentRepository, activityLogRepository }) {
    this.appointmentRepository = appointmentRepository;
    this.paymentRepository = paymentRepository;
    this.activityLogRepository = activityLogRepository;
  }

  async createAppointment(payload, actorId) {
    if (new Date(payload.startAt) >= new Date(payload.endAt)) {
      throw new ApiError(400, 'Horário de início deve ser anterior ao horário de término');
    }

    const { amount, ...appointmentData } = payload;
    const appointment = await this.appointmentRepository.create(appointmentData);

    // Criar pagamento se o valor foi fornecido
    if (amount) {
      const dueDate = new Date(appointment.startAt);
      dueDate.setDate(dueDate.getDate() + 7); // Vencimento 7 dias após o agendamento

      await this.paymentRepository.create({
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        amount,
        dueDate,
        method: 'PENDING',
        status: 'PENDING',
      });
    }

    if (actorId) {
      await this.activityLogRepository.create({
        userId: actorId,
        action: 'APPOINTMENT_CREATED',
        entity: 'Appointment',
        entityId: appointment.id,
        metadata: { status: appointment.status, amount: amount || null },
      });
    }

    return appointment;
  }

  async updateStatus(id, status, actorId) {
    const appointment = await this.appointmentRepository.update(id, { status });

    if (actorId) {
      await this.activityLogRepository.create({
        userId: actorId,
        action: 'APPOINTMENT_STATUS_UPDATED',
        entity: 'Appointment',
        entityId: appointment.id,
        metadata: { status },
      });
    }

    return appointment;
  }

  listByPeriod(startAt, endAt) {
    return this.appointmentRepository.listByPeriod(new Date(startAt), new Date(endAt));
  }

  listToday() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.appointmentRepository.listToday(start, end);
  }

  getById(id) {
    return this.appointmentRepository.getById(id);
  }
}
