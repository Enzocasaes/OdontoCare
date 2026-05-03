import { Router } from 'express';
import { container } from '../container.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { loginSchema, registerSchema, requestResetSchema, resetPasswordSchema } from '../schemas/authSchemas.js';

const router = Router();

router.post('/login', validate(loginSchema), container.authController.login);
router.post('/forgot-password', validate(requestResetSchema), container.authController.requestReset);
router.post('/reset-password', validate(resetPasswordSchema), container.authController.resetPassword);
router.post('/register', validate(registerSchema), container.authController.register);

export default router;
