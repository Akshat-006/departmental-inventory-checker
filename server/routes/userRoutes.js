import { Router } from 'express';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', authorize('admin', 'lab_assistant'), getAllUsers);
router.post('/', authorize('admin'), createUser);
router.get('/:id', authorize('admin', 'lab_assistant'), getUserById);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
