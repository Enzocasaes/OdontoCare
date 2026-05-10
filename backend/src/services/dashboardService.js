export class DashboardService {
  constructor({ dashboardRepository, appointmentRepository }) {
    this.dashboardRepository = dashboardRepository;
    this.appointmentRepository = appointmentRepository;
  }

  async getOverview(clinicId) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const [kpis, appointments] = await Promise.all([
      this.dashboardRepository.kpis(start, end, clinicId),
      this.appointmentRepository.listToday(start, end, clinicId),
    ]);

    return { kpis, appointments };
  }
}
