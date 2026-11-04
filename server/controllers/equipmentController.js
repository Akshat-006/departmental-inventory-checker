import Equipment from '../models/Equipment.js';
import Transaction from '../models/Transaction.js';

export const getEquipment = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();
    const lab = String(req.query.lab || '').trim();
    const condition = String(req.query.condition || '').trim();

    const filters = { archived: false };

    if (search) {
      filters.$or = [
        { assetCode: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) filters.category = category;
    if (lab) filters.laboratory = lab;
    if (condition) filters.condition = condition;

    const [items, total] = await Promise.all([
      Equipment.find(filters)
        .populate('laboratory')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Equipment.countDocuments(filters),
    ]);

    return res.status(200).json({
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

export const getEquipmentById = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('laboratory');

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }

    return res.status(200).json({ equipment });
  } catch (error) {
    next(error);
  }
};

export const createEquipment = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (!payload.assetCode || !payload.name || !payload.totalQuantity) {
      return res.status(400).json({ message: 'Asset code, name, and total quantity are required.' });
    }

    if (payload.totalQuantity < 0) {
      return res.status(400).json({ message: 'Total quantity cannot be negative.' });
    }

    if (payload.availableQuantity === undefined) {
      payload.availableQuantity = Number(payload.totalQuantity);
    }

    if (payload.availableQuantity < 0 || payload.availableQuantity > Number(payload.totalQuantity)) {
      return res.status(400).json({ message: 'Available quantity must be between 0 and total quantity.' });
    }

    const existing = await Equipment.findOne({ assetCode: String(payload.assetCode).trim().toUpperCase() });
    if (existing) {
      return res.status(409).json({ message: 'An equipment item with this asset code already exists.' });
    }

    const equipment = await Equipment.create(payload);
    return res.status(201).json({ equipment, message: 'Equipment created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }

    const payload = { ...req.body };
    if (payload.totalQuantity !== undefined && Number(payload.totalQuantity) < 0) {
      return res.status(400).json({ message: 'Total quantity cannot be negative.' });
    }

    const nextTotalQuantity = Number(payload.totalQuantity ?? equipment.totalQuantity);
    const nextAvailableQuantity = Number(payload.availableQuantity ?? equipment.availableQuantity);

    if (nextAvailableQuantity > nextTotalQuantity) {
      return res.status(400).json({ message: 'Available quantity cannot exceed total quantity.' });
    }

    if (payload.assetCode && payload.assetCode !== equipment.assetCode) {
      const duplicate = await Equipment.findOne({
        assetCode: String(payload.assetCode).trim().toUpperCase(),
        _id: { $ne: equipment._id },
      });

      if (duplicate) {
        return res.status(409).json({ message: 'Another equipment item already uses this asset code.' });
      }
    }

    Object.assign(equipment, payload);
    await equipment.save();

    return res.status(200).json({ equipment, message: 'Equipment updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }

    const activeTransactions = await Transaction.countDocuments({
      equipment: equipment._id,
      status: { $nin: ['returned', 'rejected'] },
    });

    if (activeTransactions > 0) {
      return res.status(409).json({
        message: 'This equipment has active transactions and cannot be deleted. Consider archiving it instead.',
      });
    }

    equipment.archived = true;
    await equipment.save();

    return res.status(200).json({ message: 'Equipment archived successfully.' });
  } catch (error) {
    next(error);
  }
};
