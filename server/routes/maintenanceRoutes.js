import { Router } from 'express';
import {
  createMaintenance,
  deleteMaintenance,
  getMaintenance,
  getMaintenanceById,
  resolveMaintenance,
  updateMaintenance,
} from '../controllers/maintenanceController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getMaintenance);
router.post('/', authorize('admin', 'lab_assistant', 'faculty'), createMaintenance);
router.get('/:id', getMaintenanceById);
router.put('/:id', authorize('admin', 'lab_assistant'), updateMaintenance);
router.patch('/:id/resolve', authorize('admin', 'lab_assistant'), resolveMaintenance);
router.delete('/:id', authorize('admin', 'lab_assistant'), deleteMaintenance);

export default router;
