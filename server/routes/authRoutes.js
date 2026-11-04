import { Router } from 'express';
import { getCurrentUser, login, logout, signup } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);

export default router;
