import { Router } from 'express';
import { exportCsv, getReportData } from '../controllers/reportController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', authorize('admin', 'lab_assistant'), getReportData);
router.get('/csv', authorize('admin', 'lab_assistant'), exportCsv);

export default router;
