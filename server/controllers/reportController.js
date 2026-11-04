import Equipment from '../models/Equipment.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import Transaction from '../models/Transaction.js';

const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value).replace(/\r?\n/g, ' ');
  if (/[",]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

export const getReportData = async (req, res, next) => {
  try {
    const inventorySummary = await Equipment.aggregate([
      { $match: { archived: false } },
      {
        $group: {
          _id: '$category',
          totalUnits: { $sum: '$totalQuantity' },
          availableUnits: { $sum: '$availableQuantity' },
          equipmentCount: { $sum: 1 },
        },
      },
      { $sort: { totalUnits: -1 } },
    ]);

    const overdueTransactions = await Transaction.find({
      status: { $in: ['issued', 'approved', 'overdue'] },
      expectedReturnDate: { $lt: new Date() },
    }).populate('equipment');

    const lowStockEquipment = await Equipment.aggregate([
      { $match: { archived: false } },
      { $match: { $expr: { $lte: ['$availableQuantity', '$minStockThreshold'] } } },
      { $sort: { availableQuantity: 1 } },
    ]);

    const maintenanceHistory = await MaintenanceRecord.find({}).populate('equipment').sort({ createdAt: -1 }).limit(20);

    return res.status(200).json({
      inventorySummary,
      overdueTransactions,
      lowStockEquipment,
      maintenanceHistory,
    });
  } catch (error) {
    next(error);
  }
};

export const exportCsv = async (req, res, next) => {
  try {
    const type = String(req.query.type || 'inventory');

    if (type === 'inventory') {
      const equipment = await Equipment.find({ archived: false }).populate('laboratory');
      const headers = ['Asset Code', 'Name', 'Category', 'Condition', 'Laboratory', 'Available', 'Total'];
      const rows = equipment.map((item) => [
        item.assetCode,
        item.name,
        item.category,
        item.condition,
        item.laboratory ? item.laboratory.name : 'Unassigned',
        item.availableQuantity,
        item.totalQuantity,
      ]);

      const csv = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="inventory-report.csv"');
      return res.status(200).send(csv);
    }

    const maintenance = await MaintenanceRecord.find({}).populate('equipment');
    const headers = ['Equipment', 'Issue Type', 'Status', 'Priority', 'Reported By', 'Resolution Date'];
    const rows = maintenance.map((item) => [
      item.equipment ? item.equipment.name : 'Unknown',
      item.issueType,
      item.status,
      item.priority,
      item.reportedBy,
      item.resolutionDate || 'Pending',
    ]);

    const csv = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="maintenance-report.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
