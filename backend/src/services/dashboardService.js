export class DashboardService {
  constructor({ dashboardRepository, appointmentRepository }) {
    this.dashboardRepository = dashboardRepository;
    this.appointmentRepository = appointmentRepository;
  }

  async getOverview() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const [kpis, appointments] = await Promise.all([
      this.dashboardRepository.kpis(start, end),
      this.appointmentRepository.listToday(start, end),
    ]);

    return { kpis, appointments };
  }
}
