import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const bootstrapAdmin = async () => {
  const adminName = process.env.ADMIN_NAME || 'Department Administrator';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@college.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminDepartment = process.env.ADMIN_DEPARTMENT || 'Computer Science';

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required. Copy server/.env.example to server/.env and configure it first.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    console.log('An administrator account already exists. Bootstrap skipped.');
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: adminName,
    email: adminEmail.trim().toLowerCase(),
    passwordHash,
    role: 'admin',
    department: adminDepartment,
    isActive: true,
  });

  console.log(`Admin account created: ${adminEmail} (${adminName})`);
  await mongoose.disconnect();
};

bootstrapAdmin().catch((error) => {
  console.error('Bootstrap failed:', error.message);
  process.exit(1);
});
