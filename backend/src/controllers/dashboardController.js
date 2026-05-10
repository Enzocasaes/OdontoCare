import { asyncHandler } from '../utils/asyncHandler.js';

export class DashboardController {
  constructor({ dashboardService }) {
    this.dashboardService = dashboardService;
  }

  overview = asyncHandler(async (req, res) => {
    const data = await this.dashboardService.getOverview(req.user?.clinicId);
    res.json(data);
  });
}
