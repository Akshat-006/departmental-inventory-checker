import Equipment from '../models/Equipment.js';
import Transaction from '../models/Transaction.js';

const buildReferenceNumber = () => `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export const getTransactions = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;
    const status = String(req.query.status || '').trim();
    const borrower = String(req.query.borrower || '').trim();
    const equipment = String(req.query.equipment || '').trim();

    const filters = {};
    if (req.user.role === 'faculty') {
      filters.borrowerEmail = req.user.email;
    }
    if (status) filters.status = status;
    if (borrower) filters.borrowerName = { $regex: borrower, $options: 'i' };
    if (equipment) {
      const equipmentDoc = await Equipment.findOne({ assetCode: { $regex: equipment, $options: 'i' } }).select('_id');
      if (equipmentDoc) filters.equipment = equipmentDoc._id;
    }

    const [items, total] = await Promise.all([
      Transaction.find(filters)
        .populate('equipment')
        .populate('issuedBy', 'name email role')
        .populate('receivedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filters),
    ]);

    return res.status(200).json({ items, total, page, limit, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('equipment')
      .populate('issuedBy', 'name email role')
      .populate('receivedBy', 'name email role');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (req.user.role === 'faculty' && transaction.borrowerEmail !== req.user.email) {
      return res.status(403).json({ message: 'You can only view your own transactions.' });
    }

    return res.status(200).json({ transaction });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (!payload.equipment || !payload.borrowerName || !payload.borrowerEmail || !payload.borrowerRole || !payload.quantity) {
      return res.status(400).json({ message: 'Equipment, borrower, quantity, and date details are required.' });
    }

    const equipment = await Equipment.findById(payload.equipment);
    if (!equipment || equipment.archived) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }

    if (Number(payload.quantity) <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than zero.' });
    }

    if (Number(payload.quantity) > equipment.availableQuantity) {
      return res.status(409).json({ message: 'Insufficient stock for the requested quantity.' });
    }

    const isFacultyRequest = req.user.role === 'faculty';
    const transaction = await Transaction.create({
      ...payload,
      referenceNumber: buildReferenceNumber(),
      quantity: Number(payload.quantity),
      borrowerName: isFacultyRequest ? req.user.name : payload.borrowerName,
      borrowerEmail: isFacultyRequest ? req.user.email : String(payload.borrowerEmail).toLowerCase().trim(),
      borrowerRole: isFacultyRequest ? 'faculty' : req.user.role,
      status: isFacultyRequest ? 'pending' : 'approved',
      issuedBy: isFacultyRequest ? null : req.user._id,
    });

    return res.status(201).json({ transaction, message: 'Transaction created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const approveTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const equipment = await Equipment.findById(transaction.equipment);
    if (!equipment || equipment.archived) {
      return res.status(404).json({ message: 'Related equipment not found.' });
    }

    if (equipment.availableQuantity < transaction.quantity) {
      return res.status(409).json({ message: 'Insufficient stock available to approve this transaction.' });
    }

    transaction.status = 'approved';
    transaction.issuedBy = req.user._id;
    await transaction.save();

    return res.status(200).json({ transaction, message: 'Transaction approved.' });
  } catch (error) {
    next(error);
  }
};

export const issueTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    const equipment = await Equipment.findById(transaction.equipment);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }

    if (transaction.status === 'returned') {
      return res.status(400).json({ message: 'This equipment has already been returned.' });
    }

    if (equipment.availableQuantity < transaction.quantity) {
      return res.status(409).json({ message: 'Insufficient stock available to issue equipment.' });
    }

    equipment.availableQuantity -= transaction.quantity;
    equipment.condition = 'good';
    transaction.status = 'issued';
    transaction.issueDate = new Date();
    transaction.issuedBy = req.user._id;

    await Promise.all([equipment.save(), transaction.save()]);

    return res.status(200).json({ transaction, equipment, message: 'Equipment issued successfully.' });
  } catch (error) {
    next(error);
  }
};

export const returnTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (transaction.status === 'returned') {
      return res.status(400).json({ message: 'This transaction has already been returned.' });
    }

    const equipment = await Equipment.findById(transaction.equipment);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }

    const nextAvailable = equipment.availableQuantity + transaction.quantity;
    equipment.availableQuantity = nextAvailable;
    equipment.totalQuantity = Math.max(equipment.totalQuantity, equipment.availableQuantity);

    transaction.status = 'returned';
    transaction.actualReturnDate = new Date();
    transaction.receivedBy = req.user._id;

    await Promise.all([equipment.save(), transaction.save()]);

    return res.status(200).json({ transaction, equipment, message: 'Equipment returned successfully.' });
  } catch (error) {
    next(error);
  }
};
