import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import app from '../app.js';
import User from '../models/User.js';
import Equipment from '../models/Equipment.js';
import Laboratory from '../models/Laboratory.js';

let mongoServer;
let adminToken;
let facultyToken;
let equipmentId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.COOKIE_NAME = 'department_inventory_token';

  await mongoose.connect(process.env.MONGODB_URI);

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await User.create({
    name: 'Admin User',
    email: 'admin@college.edu',
    passwordHash: adminPassword,
    role: 'admin',
    department: 'Computer Science',
    isActive: true,
  });

  const facultyPassword = await bcrypt.hash('Faculty@123', 10);
  await User.create({
    name: 'Faculty User',
    email: 'faculty@college.edu',
    passwordHash: facultyPassword,
    role: 'faculty',
    department: 'Electronics',
    isActive: true,
  });

  const lab = await Laboratory.create({
    name: 'Embedded Systems Lab',
    code: 'ESL-101',
    department: 'Electronics',
    building: 'Science Block',
    roomNumber: 'A-12',
    capacity: 24,
  });

  const equipment = await Equipment.create({
    assetCode: 'EQ-1001',
    name: 'Oscilloscope',
    description: 'Digital oscilloscope',
    category: 'Electronics',
    manufacturer: 'Tektronix',
    modelNumber: 'MDO-3012',
    laboratory: lab._id,
    totalQuantity: 5,
    availableQuantity: 5,
    condition: 'good',
    minStockThreshold: 1,
  });

  equipmentId = equipment._id.toString();

  const adminRes = await request(app).post('/api/v1/auth/login').send({ email: 'admin@college.edu', password: 'Admin@123' });
  adminToken = adminRes.body.token;

  const facultyRes = await request(app).post('/api/v1/auth/login').send({ email: 'faculty@college.edu', password: 'Faculty@123' });
  facultyToken = facultyRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Authentication and authorization', () => {
  it('creates public accounts with faculty permissions only', async () => {
    const browser = request.agent(app);
    const response = await browser
      .post('/api/v1/auth/signup')
      .send({
        name: 'New Faculty',
        email: 'new.faculty@college.edu',
        department: 'Computer Science',
        password: 'StrongPass123',
        role: 'admin',
        isActive: false,
      });

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('faculty');
    expect(response.body.user.isActive).toBe(true);
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.headers['set-cookie']).toBeDefined();

    const createdUser = await User.findOne({ email: 'new.faculty@college.edu' });
    expect(await bcrypt.compare('StrongPass123', createdUser.passwordHash)).toBe(true);

    const currentUser = await browser.get('/api/v1/auth/me');
    expect(currentUser.status).toBe(200);
    expect(currentUser.body.user.email).toBe('new.faculty@college.edu');
  });

  it('rejects duplicate signups and short passwords', async () => {
    const duplicate = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: 'Existing Faculty',
        email: 'faculty@college.edu',
        department: 'Electronics',
        password: 'StrongPass123',
      });
    expect(duplicate.status).toBe(409);

    const shortPassword = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: 'Short Password',
        email: 'short@college.edu',
        department: 'Electronics',
        password: 'short',
      });
    expect(shortPassword.status).toBe(400);
  });

  it('logs in and returns a current user', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('admin@college.edu');
  });

  it('rejects access without a valid token', async () => {
    const response = await request(app).get('/api/v1/users');
    expect(response.status).toBe(401);
  });
});

describe('Equipment validation and transaction stock logic', () => {
  it('prevents negative or invalid stock quantities', async () => {
    const response = await request(app)
      .post('/api/v1/equipment')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assetCode: 'EQ-1002',
        name: 'Invalid test equipment',
        totalQuantity: 2,
        availableQuantity: 5,
      });

    expect(response.status).toBe(400);
  });

  it('creates a pending request and then issues stock atomically', async () => {
    const requestRes = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        equipment: equipmentId,
        borrowerName: 'Faculty Person',
        borrowerEmail: 'faculty.person@college.edu',
        borrowerRole: 'faculty',
        quantity: 2,
        expectedReturnDate: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(requestRes.status).toBe(201);
    expect(requestRes.body.transaction.borrowerName).toBe('Faculty User');
    expect(requestRes.body.transaction.borrowerEmail).toBe('faculty@college.edu');
    expect(requestRes.body.transaction.borrowerRole).toBe('faculty');
    const transactionId = requestRes.body.transaction._id;

    const approveRes = await request(app)
      .patch(`/api/v1/transactions/${transactionId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(approveRes.status).toBe(200);

    const issueRes = await request(app)
      .patch(`/api/v1/transactions/${transactionId}/issue`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(issueRes.status).toBe(200);
    expect(issueRes.body.equipment.availableQuantity).toBe(3);

    const returnRes = await request(app)
      .patch(`/api/v1/transactions/${transactionId}/return`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(returnRes.status).toBe(200);
    expect(returnRes.body.equipment.availableQuantity).toBe(5);
    expect(returnRes.body.transaction.status).toBe('returned');
  });

  it('rejects insufficient stock', async () => {
    const response = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        equipment: equipmentId,
        borrowerName: 'Another Faculty',
        borrowerEmail: 'another@college.edu',
        borrowerRole: 'faculty',
        quantity: 20,
        expectedReturnDate: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(response.status).toBe(409);
  });

  it('limits faculty transaction history to their own requests', async () => {
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        equipment: equipmentId,
        borrowerName: 'Private Borrower',
        borrowerEmail: 'private@college.edu',
        borrowerRole: 'faculty',
        quantity: 1,
        expectedReturnDate: new Date(Date.now() + 86400000).toISOString(),
      });

    const response = await request(app)
      .get('/api/v1/transactions')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(response.status).toBe(200);
    expect(response.body.items.every((item) => item.borrowerEmail === 'faculty@college.edu')).toBe(true);
  });
});

describe('Maintenance and admin restrictions', () => {
  it('marks maintenance as resolved and blocks unauthorized access', async () => {
    const maintenanceRes = await request(app)
      .post('/api/v1/maintenance')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        equipment: equipmentId,
        issueType: 'damaged',
        description: 'Screen flicker observed',
        reportedBy: 'Lab Assistant',
        priority: 'high',
      });

    expect(maintenanceRes.status).toBe(201);

    const maintenanceId = maintenanceRes.body.maintenance._id;
    const resolveRes = await request(app)
      .patch(`/api/v1/maintenance/${maintenanceId}/resolve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ resolutionNotes: 'Display replaced.' });

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.maintenance.status).toBe('resolved');

    const unauthorizedRes = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(unauthorizedRes.status).toBe(403);
  });
});
