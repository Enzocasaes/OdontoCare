import { Router } from 'express';
import { container } from '../container.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { clinicCreateSchema, clinicMemberSchema } from '../schemas/clinicSchemas.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/mine', container.clinicController.mine);
router.post('/', validate(clinicCreateSchema), container.clinicController.create);
router.patch('/:clinicId', validate(clinicCreateSchema), container.clinicController.update);
router.delete('/:clinicId', container.clinicController.delete);
router.post('/:clinicId/members', validate(clinicMemberSchema), container.clinicController.addMember);

export default router;