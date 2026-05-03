import { asyncHandler } from '../utils/asyncHandler.js';

export class UserController {
  constructor({ userService }) {
    this.userService = userService;
  }

  list = asyncHandler(async (_req, res) => {
    const users = await this.userService.listUsers();
    res.json(users);
  });
}
