import { Router } from 'express';
import {
  approveTransaction,
  createTransaction,
  getTransactionById,
  getTransactions,
  issueTransaction,
  returnTransaction,
} from '../controllers/transactionController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/:id', getTransactionById);
router.patch('/:id/approve', authorize('admin', 'lab_assistant'), approveTransaction);
router.patch('/:id/issue', authorize('admin', 'lab_assistant'), issueTransaction);
router.patch('/:id/return', authorize('admin', 'lab_assistant'), returnTransaction);

export default router;
