import { asyncHandler } from '../utils/asyncHandler.js';

export class UserController {
  constructor({ userService }) {
    this.userService = userService;
  }

  list = asyncHandler(async (req, res) => {
    const users = await this.userService.listUsers(req.user);
    res.json(users);
  });
}
