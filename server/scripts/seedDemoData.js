import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Equipment from '../models/Equipment.js';
import Laboratory from '../models/Laboratory.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

dotenv.config();

const demoUsers = [
  {
    name: 'Aarav Kulkarni',
    email: 'assistant.demo@college.edu',
    password: 'LabAssistant@123',
    role: 'lab_assistant',
    department: 'Computer Science',
  },
  {
    name: 'Dr. Meera Iyer',
    email: 'faculty.demo@college.edu',
    password: 'Faculty@123',
    role: 'faculty',
    department: 'Computer Science',
  },
];

const labs = [
  {
    name: 'Computer Systems Lab',
    code: 'CS-LAB-01',
    department: 'Computer Science',
    building: 'Main Academic Block',
    roomNumber: 'A-204',
    capacity: 36,
    description: 'Computer systems, programming, and operating systems practicals.',
  },
  {
    name: 'Network and IoT Lab',
    code: 'CS-LAB-02',
    department: 'Computer Science',
    building: 'Main Academic Block',
    roomNumber: 'A-210',
    capacity: 28,
    description: 'Networking, embedded systems, and Internet of Things practicals.',
  },
  {
    name: 'Electronics Lab',
    code: 'EC-LAB-01',
    department: 'Electronics',
    building: 'Science Block',
    roomNumber: 'B-116',
    capacity: 30,
    description: 'Electronics measurement and circuit prototyping.',
  },
  {
    name: 'Project and Robotics Lab',
    code: 'CS-LAB-03',
    department: 'Computer Science',
    building: 'Innovation Block',
    roomNumber: 'C-302',
    capacity: 24,
    description: 'Student project, robotics, and prototyping workspace.',
  },
];

const equipmentFixtures = [
  {
    assetCode: 'DEMO-COMP-001',
    name: 'Desktop Computer',
    description: 'Department workstation for programming and lab practicals.',
    category: 'Computer',
    manufacturer: 'Lenovo',
    modelNumber: 'ThinkCentre M70',
    serialNumber: 'DEMO-PC-001',
    labCode: 'CS-LAB-01',
    totalQuantity: 12,
    availableQuantity: 10,
    condition: 'good',
    minStockThreshold: 3,
    purchaseCost: 62000,
    supplier: 'Campus IT Store',
  },
  {
    assetCode: 'DEMO-COMP-002',
    name: 'Laptop',
    description: 'Portable laptop pool for faculty presentations and project reviews.',
    category: 'Computer',
    manufacturer: 'Dell',
    modelNumber: 'Latitude 5440',
    serialNumber: 'DEMO-LT-002',
    labCode: 'CS-LAB-01',
    totalQuantity: 6,
    availableQuantity: 6,
    condition: 'good',
    minStockThreshold: 2,
    purchaseCost: 78000,
    supplier: 'Campus IT Store',
  },
  {
    assetCode: 'DEMO-NET-001',
    name: 'Managed Network Switch',
    description: '24-port managed switch used for networking exercises.',
    category: 'Networking',
    manufacturer: 'Cisco',
    modelNumber: 'CBS350-24T',
    serialNumber: 'DEMO-SW-001',
    labCode: 'CS-LAB-02',
    totalQuantity: 4,
    availableQuantity: 4,
    condition: 'good',
    minStockThreshold: 1,
    purchaseCost: 28500,
    supplier: 'Network Solutions',
  },
  {
    assetCode: 'DEMO-NET-002',
    name: 'Wi-Fi Access Point',
    description: 'Wireless access point for network configuration practicals.',
    category: 'Networking',
    manufacturer: 'TP-Link',
    modelNumber: 'EAP610',
    serialNumber: 'DEMO-AP-002',
    labCode: 'CS-LAB-02',
    totalQuantity: 3,
    availableQuantity: 2,
    condition: 'warning',
    minStockThreshold: 1,
    purchaseCost: 9200,
    supplier: 'Network Solutions',
    remarks: 'One unit reported with intermittent power; see maintenance log.',
  },
  {
    assetCode: 'DEMO-ELX-001',
    name: 'Digital Oscilloscope',
    description: 'Two-channel oscilloscope for signal measurement.',
    category: 'Laboratory Instrument',
    manufacturer: 'Keysight',
    modelNumber: 'EDUX1002G',
    serialNumber: 'DEMO-OSC-001',
    labCode: 'EC-LAB-01',
    totalQuantity: 5,
    availableQuantity: 5,
    condition: 'good',
    minStockThreshold: 1,
    purchaseCost: 54000,
    supplier: 'Electro Lab Supplies',
  },
  {
    assetCode: 'DEMO-ELX-002',
    name: 'Digital Multimeter',
    description: 'Handheld digital meter for voltage, current, and resistance labs.',
    category: 'Electronics',
    manufacturer: 'Fluke',
    modelNumber: '117',
    serialNumber: 'DEMO-DMM-002',
    labCode: 'EC-LAB-01',
    totalQuantity: 10,
    availableQuantity: 10,
    condition: 'good',
    minStockThreshold: 3,
    purchaseCost: 11500,
    supplier: 'Electro Lab Supplies',
  },
  {
    assetCode: 'DEMO-ROB-001',
    name: 'Arduino Development Kit',
    description: 'Microcontroller board and accessory kit for embedded projects.',
    category: 'Electronics',
    manufacturer: 'Arduino',
    modelNumber: 'Uno R3 Kit',
    serialNumber: 'DEMO-ARD-001',
    labCode: 'CS-LAB-03',
    totalQuantity: 16,
    availableQuantity: 16,
    condition: 'good',
    minStockThreshold: 4,
    purchaseCost: 2800,
    supplier: 'Maker Lab Store',
  },
  {
    assetCode: 'DEMO-ROB-002',
    name: 'Soldering Station',
    description: 'Temperature-controlled soldering station for prototype work.',
    category: 'Laboratory Instrument',
    manufacturer: 'Hakko',
    modelNumber: 'FX-888D',
    serialNumber: 'DEMO-SOL-002',
    labCode: 'CS-LAB-03',
    totalQuantity: 3,
    availableQuantity: 3,
    condition: 'maintenance',
    minStockThreshold: 1,
    purchaseCost: 14500,
    supplier: 'Maker Lab Store',
  },
  {
    assetCode: 'DEMO-PER-001',
    name: 'Laser Printer',
    description: 'Shared monochrome printer for lab handouts and reports.',
    category: 'Peripheral',
    manufacturer: 'HP',
    modelNumber: 'LaserJet Pro M404',
    serialNumber: 'DEMO-PR-001',
    labCode: 'CS-LAB-01',
    totalQuantity: 2,
    availableQuantity: 1,
    condition: 'good',
    minStockThreshold: 1,
    purchaseCost: 32000,
    supplier: 'Campus IT Store',
  },
];

const ensureDocument = async (Model, filter, values) => {
  const existing = await Model.findOne(filter);
  if (existing) return { document: existing, created: false };
  return { document: await Model.create(values), created: true };
};

const seedDemoData = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required to seed demo data.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await User.findOne({ role: 'admin', isActive: true });
  if (!admin) {
    throw new Error('Create an administrator first by running npm run bootstrap:admin.');
  }

  let createdUserCount = 0;
  for (const fixture of demoUsers) {
    const existing = await User.findOne({ email: fixture.email });
    if (existing) continue;

    await User.create({
      name: fixture.name,
      email: fixture.email,
      passwordHash: await bcrypt.hash(fixture.password, 10),
      role: fixture.role,
      department: fixture.department,
      isActive: true,
    });
    createdUserCount += 1;
  }

  const assistant = await User.findOne({ email: 'assistant.demo@college.edu' });
  const faculty = await User.findOne({ email: 'faculty.demo@college.edu' });

  const labsByCode = new Map();
  let createdLabCount = 0;
  for (const fixture of labs) {
    const { document, created } = await ensureDocument(
      Laboratory,
      { code: fixture.code },
      { ...fixture, assignedLabAssistant: assistant?._id || null },
    );
    labsByCode.set(fixture.code, document);
    if (created) createdLabCount += 1;
  }

  const equipmentByCode = new Map();
  let createdEquipmentCount = 0;
  for (const fixture of equipmentFixtures) {
    const { labCode, ...equipmentFields } = fixture;
    const { document, created } = await ensureDocument(
      Equipment,
      { assetCode: fixture.assetCode },
      {
        ...equipmentFields,
        laboratory: labsByCode.get(labCode)?._id || null,
        purchaseDate: new Date('2024-08-15T00:00:00.000Z'),
      },
    );
    equipmentByCode.set(fixture.assetCode, document);
    if (created) createdEquipmentCount += 1;
  }

  const laptop = equipmentByCode.get('DEMO-COMP-001');
  const overdueReference = 'DEMO-TXN-OVERDUE-001';
  let createdTransactionCount = 0;
  const overdueExists = await Transaction.exists({ referenceNumber: overdueReference });
  if (!overdueExists) {
    await Transaction.create({
      referenceNumber: overdueReference,
      equipment: laptop._id,
      borrowerName: faculty.name,
      borrowerEmail: faculty.email,
      borrowerRole: 'faculty',
      quantity: 2,
      issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      expectedReturnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'issued',
      issuedBy: admin._id,
      notes: 'Demo record: equipment return is past the expected date.',
    });
    createdTransactionCount += 1;
  }

  const activeLoanFixtures = [
    {
      referenceNumber: 'DEMO-TXN-ISSUED-AP-001',
      assetCode: 'DEMO-NET-002',
      quantity: 1,
      dueInDays: 4,
      notes: 'Demo record: access point is issued for a networking practical.',
    },
    {
      referenceNumber: 'DEMO-TXN-ISSUED-PRINTER-001',
      assetCode: 'DEMO-PER-001',
      quantity: 1,
      dueInDays: 2,
      notes: 'Demo record: printer is assigned to a department office.',
    },
  ];

  for (const fixture of activeLoanFixtures) {
    const alreadyExists = await Transaction.exists({ referenceNumber: fixture.referenceNumber });
    if (alreadyExists) continue;

    await Transaction.create({
      referenceNumber: fixture.referenceNumber,
      equipment: equipmentByCode.get(fixture.assetCode)._id,
      borrowerName: faculty.name,
      borrowerEmail: faculty.email,
      borrowerRole: 'faculty',
      quantity: fixture.quantity,
      issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expectedReturnDate: new Date(Date.now() + fixture.dueInDays * 24 * 60 * 60 * 1000),
      status: 'issued',
      issuedBy: admin._id,
      notes: fixture.notes,
    });
    createdTransactionCount += 1;
  }

  const pendingReference = 'DEMO-TXN-PENDING-001';
  const pendingExists = await Transaction.exists({ referenceNumber: pendingReference });
  if (!pendingExists) {
    await Transaction.create({
      referenceNumber: pendingReference,
      equipment: equipmentByCode.get('DEMO-ROB-001')._id,
      borrowerName: faculty.name,
      borrowerEmail: faculty.email,
      borrowerRole: 'faculty',
      quantity: 1,
      expectedReturnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'pending',
      notes: 'Demo record: pending approval for a project practical.',
    });
    createdTransactionCount += 1;
  }

  const returnedReference = 'DEMO-TXN-RETURNED-001';
  const returnedExists = await Transaction.exists({ referenceNumber: returnedReference });
  if (!returnedExists) {
    await Transaction.create({
      referenceNumber: returnedReference,
      equipment: equipmentByCode.get('DEMO-ELX-001')._id,
      borrowerName: faculty.name,
      borrowerEmail: faculty.email,
      borrowerRole: 'faculty',
      quantity: 1,
      issueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      expectedReturnDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      actualReturnDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      status: 'returned',
      issuedBy: admin._id,
      receivedBy: assistant?._id || admin._id,
      notes: 'Demo record: returned in good condition.',
    });
    createdTransactionCount += 1;
  }

  let createdMaintenanceCount = 0;
  const maintenanceFixtures = [
    {
      equipment: equipmentByCode.get('DEMO-NET-002')._id,
      issueType: 'malfunctioning',
      description: 'Access point restarts intermittently during extended lab sessions.',
      reportedBy: assistant?.name || 'Lab Assistant',
      priority: 'medium',
      status: 'in_progress',
      assignedTechnician: assistant?._id || null,
    },
    {
      equipment: equipmentByCode.get('DEMO-ROB-002')._id,
      issueType: 'preventive',
      description: 'Routine inspection and tip replacement are required before the next project session.',
      reportedBy: assistant?.name || 'Lab Assistant',
      priority: 'low',
      status: 'reported',
      assignedTechnician: assistant?._id || null,
    },
  ];

  for (let index = 0; index < maintenanceFixtures.length; index += 1) {
    const fixture = maintenanceFixtures[index];
    const equipmentCode = index === 0 ? 'DEMO-NET-002' : 'DEMO-ROB-002';
    const existingEquipmentMaintenance = await MaintenanceRecord.exists({
      equipment: equipmentByCode.get(equipmentCode)._id,
      description: fixture.description,
    });
    if (existingEquipmentMaintenance) continue;

    await MaintenanceRecord.create(fixture);
    createdMaintenanceCount += 1;
  }

  console.log(`Demo seed completed in database "${mongoose.connection.name}".`);
  console.log(
    JSON.stringify({
      createdUsers: createdUserCount,
      createdLaboratories: createdLabCount,
      createdEquipment: createdEquipmentCount,
      createdTransactions: createdTransactionCount,
      createdMaintenanceRecords: createdMaintenanceCount,
      note: 'Existing records were preserved; rerunning does not duplicate seeded data.',
    }),
  );
  console.log('Demo logins (created only if those emails were not already present):');
  console.log('Faculty: faculty.demo@college.edu / Faculty@123');
  console.log('Lab assistant: assistant.demo@college.edu / LabAssistant@123');
};

seedDemoData()
  .catch((error) => {
    console.error('Demo seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
