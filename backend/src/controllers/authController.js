import { asyncHandler } from '../utils/asyncHandler.js';

export class AuthController {
  constructor({ authService }) {
    this.authService = authService;
  }

  register = asyncHandler(async (req, res) => {
    const user = await this.authService.register(req.body, req.user);
    res.status(201).json(user);
  });

  login = asyncHandler(async (req, res) => {
    const data = await this.authService.login(req.body);
    res.json(data);
  });

  requestReset = asyncHandler(async (req, res) => {
    const data = await this.authService.requestPasswordReset(req.body.email);
    res.json(data);
  });

  resetPassword = asyncHandler(async (req, res) => {
    const data = await this.authService.resetPassword(req.body.token, req.body.newPassword);
    res.json(data);
  });
}
