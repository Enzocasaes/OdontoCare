import { Router } from 'express';
import { container } from '../container.js';

const router = Router();

router.get('/overview', container.dashboardController.overview);

export default router;
