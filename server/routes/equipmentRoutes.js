import { Router } from 'express';
import {
  createEquipment,
  deleteEquipment,
  getEquipment,
  getEquipmentById,
  updateEquipment,
} from '../controllers/equipmentController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getEquipment);
router.post('/', authorize('admin', 'lab_assistant'), createEquipment);
router.get('/:id', getEquipmentById);
router.put('/:id', authorize('admin', 'lab_assistant'), updateEquipment);
router.delete('/:id', authorize('admin', 'lab_assistant'), deleteEquipment);

export default router;
