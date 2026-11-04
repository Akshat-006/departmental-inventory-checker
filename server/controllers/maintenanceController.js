import Equipment from '../models/Equipment.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';

export const getMaintenance = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;
    const status = String(req.query.status || '').trim();
    const equipment = String(req.query.equipment || '').trim();

    const filters = {};
    if (status) filters.status = status;
    if (equipment) {
      const item = await Equipment.findOne({ assetCode: { $regex: equipment, $options: 'i' } }).select('_id');
      if (item) filters.equipment = item._id;
    }

    const [items, total] = await Promise.all([
      MaintenanceRecord.find(filters).populate('equipment').populate('assignedTechnician', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      MaintenanceRecord.countDocuments(filters),
    ]);

    return res.status(200).json({ items, total, page, limit, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceById = async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.findById(req.params.id).populate('equipment').populate('assignedTechnician', 'name email');
    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found.' });
    }
    return res.status(200).json({ maintenance: record });
  } catch (error) {
    next(error);
  }
};

export const createMaintenance = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.equipment || !payload.issueType || !payload.description || !payload.reportedBy) {
      return res.status(400).json({ message: 'Equipment, issue type, description, and reporter are required.' });
    }

    const equipment = await Equipment.findById(payload.equipment);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }

    if (payload.issueType === 'damaged' || payload.issueType === 'missing') {
      equipment.condition = 'damaged';
      await equipment.save();
    }

    const record = await MaintenanceRecord.create(payload);
    return res.status(201).json({ maintenance: record, message: 'Maintenance record created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateMaintenance = async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found.' });
    }

    Object.assign(record, req.body);
    await record.save();
    return res.status(200).json({ maintenance: record, message: 'Maintenance record updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const resolveMaintenance = async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found.' });
    }

    record.status = 'resolved';
    record.resolutionNotes = req.body.resolutionNotes || record.resolutionNotes;
    record.resolutionDate = new Date();

    const equipment = await Equipment.findById(record.equipment);
    if (equipment) {
      equipment.condition = equipment.availableQuantity <= 0 ? 'warning' : 'good';
      await equipment.save();
    }

    await record.save();
    return res.status(200).json({ maintenance: record, message: 'Maintenance record resolved.' });
  } catch (error) {
    next(error);
  }
};

export const deleteMaintenance = async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found.' });
    }
    await record.deleteOne();
    return res.status(200).json({ message: 'Maintenance record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
