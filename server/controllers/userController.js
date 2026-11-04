import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 100);
    const search = String(req.query.search || '').trim();
    const role = String(req.query.role || '').trim();
    const skip = (page - 1) * limit;

    const filters = {};
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filters.role = role;

    const [users, total] = await Promise.all([
      User.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-passwordHash'),
      User.countDocuments(filters),
    ]);

    return res.status(200).json({ users, total, page, limit, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({ message: 'Name, email, password, role, and department are required.' });
    }

    const existingUser = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'A user already exists with this email address.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
      department,
    });

    return res.status(201).json({ user: { ...user.toObject(), passwordHash: undefined }, message: 'User created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { name, email, role, department, isActive } = req.body;

    if (req.user.role !== 'admin' && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own profile.' });
    }

    if (email && email !== user.email) {
      const duplicate = await User.findOne({ email: String(email).trim().toLowerCase(), _id: { $ne: user._id } });
      if (duplicate) {
        return res.status(409).json({ message: 'This email is already in use.' });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email.trim().toLowerCase();
    if (role) user.role = role;
    if (department) user.department = department;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });
    if (user.role !== 'admin' && activeAdmins === 1 && user.isActive === false) {
      return res.status(400).json({ message: 'At least one active administrator must remain in the system.' });
    }

    await user.save();
    return res.status(200).json({ user: { ...user.toObject(), passwordHash: undefined }, message: 'User updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'admin') {
      const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true, _id: { $ne: user._id } });
      if (activeAdmins === 0) {
        return res.status(400).json({ message: 'Cannot deactivate the only active administrator.' });
      }
    }

    user.isActive = false;
    await user.save();
    return res.status(200).json({ message: 'User deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};
