import { asyncHandler } from '../utils/asyncHandler.js';

export class DashboardController {
  constructor({ dashboardService }) {
    this.dashboardService = dashboardService;
  }

  overview = asyncHandler(async (_req, res) => {
    const data = await this.dashboardService.getOverview();
    res.json(data);
  });
}
