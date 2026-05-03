import { asyncHandler } from '../utils/asyncHandler.js';

export class LogController {
  constructor({ activityLogRepository }) {
    this.activityLogRepository = activityLogRepository;
  }

  list = asyncHandler(async (_req, res) => {
    const logs = await this.activityLogRepository.list(200);
    res.json(logs);
  });
}
