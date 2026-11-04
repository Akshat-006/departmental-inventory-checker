import { Router } from 'express';
import {
  createLaboratory,
  deleteLaboratory,
  getLaboratoryById,
  getLaboratories,
  updateLaboratory,
} from '../controllers/laboratoryController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getLaboratories);
router.post('/', authorize('admin', 'lab_assistant'), createLaboratory);
router.get('/:id', getLaboratoryById);
router.put('/:id', authorize('admin', 'lab_assistant'), updateLaboratory);
router.delete('/:id', authorize('admin', 'lab_assistant'), deleteLaboratory);

export default router;
