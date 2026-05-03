import { Router } from 'express';
import { container } from '../container.js';

const router = Router();

router.get('/', container.logController.list);

export default router;
