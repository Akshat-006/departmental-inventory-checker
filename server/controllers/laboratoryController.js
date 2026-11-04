import Equipment from '../models/Equipment.js';
import Laboratory from '../models/Laboratory.js';

export const getLaboratories = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Laboratory.find().populate('assignedLabAssistant').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Laboratory.countDocuments(),
    ]);

    const enriched = await Promise.all(
      items.map(async (lab) => {
        const equipmentCount = await Equipment.countDocuments({ laboratory: lab._id, archived: false });
        return { ...lab.toObject(), equipmentCount };
      }),
    );

    return res.status(200).json({
      items: enriched,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

export const getLaboratoryById = async (req, res, next) => {
  try {
    const lab = await Laboratory.findById(req.params.id).populate('assignedLabAssistant');
    if (!lab) {
      return res.status(404).json({ message: 'Laboratory not found.' });
    }

    const equipmentCount = await Equipment.countDocuments({ laboratory: lab._id, archived: false });
    return res.status(200).json({ laboratory: { ...lab.toObject(), equipmentCount } });
  } catch (error) {
    next(error);
  }
};

export const createLaboratory = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (!payload.name || !payload.code || !payload.department || !payload.building || !payload.roomNumber) {
      return res.status(400).json({ message: 'All required laboratory fields must be provided.' });
    }

    const existing = await Laboratory.findOne({ code: String(payload.code).trim().toUpperCase() });
    if (existing) {
      return res.status(409).json({ message: 'A laboratory with this code already exists.' });
    }

    const lab = await Laboratory.create(payload);
    return res.status(201).json({ laboratory: lab, message: 'Laboratory created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateLaboratory = async (req, res, next) => {
  try {
    const lab = await Laboratory.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: 'Laboratory not found.' });
    }

    if (req.body.code && req.body.code !== lab.code) {
      const duplicate = await Laboratory.findOne({ code: String(req.body.code).trim().toUpperCase(), _id: { $ne: lab._id } });
      if (duplicate) {
        return res.status(409).json({ message: 'A laboratory with this code already exists.' });
      }
    }

    Object.assign(lab, req.body);
    await lab.save();
    return res.status(200).json({ laboratory: lab, message: 'Laboratory updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteLaboratory = async (req, res, next) => {
  try {
    const lab = await Laboratory.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: 'Laboratory not found.' });
    }

    const hasEquipment = await Equipment.exists({ laboratory: lab._id, archived: false });
    if (hasEquipment) {
      return res.status(409).json({ message: 'This laboratory is still assigned to equipment. Reassign or archive the equipment first.' });
    }

    await lab.deleteOne();
    return res.status(200).json({ message: 'Laboratory deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
