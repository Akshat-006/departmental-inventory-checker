import Equipment from '../models/Equipment.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import Transaction from '../models/Transaction.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const equipmentTotals = await Equipment.aggregate([
      { $match: { archived: false } },
      {
        $group: {
          _id: null,
          totalEquipment: { $sum: 1 },
          totalPhysicalUnits: { $sum: '$totalQuantity' },
          availableUnits: { $sum: '$availableQuantity' },
          damagedUnits: {
            $sum: {
              $cond: [{ $in: ['$condition', ['damaged', 'maintenance']] }, 1, 0],
            },
          },
        },
      },
    ]);

    const totalEquipment = equipmentTotals[0]?.totalEquipment || 0;
    const totalPhysicalUnits = equipmentTotals[0]?.totalPhysicalUnits || 0;
    const availableUnits = equipmentTotals[0]?.availableUnits || 0;
    const issuedUnits = Math.max(totalPhysicalUnits - availableUnits, 0);
    const damagedUnits = equipmentTotals[0]?.damagedUnits || 0;

    const pendingMaintenance = await MaintenanceRecord.countDocuments({
      status: { $in: ['reported', 'in_progress'] },
    });

    const overdueTransactions = await Transaction.countDocuments({
      status: { $in: ['issued', 'approved', 'overdue'] },
      expectedReturnDate: { $lt: new Date() },
    });

    const recentTransactions = await Transaction.find(req.user.role === 'faculty' ? { borrowerEmail: req.user.email } : {})
      .populate('equipment')
      .sort({ createdAt: -1 })
      .limit(5);

    const lowStockEquipment = await Equipment.aggregate([
      { $match: { archived: false } },
      { $match: { $expr: { $lte: ['$availableQuantity', '$minStockThreshold'] } } },
      { $sort: { availableQuantity: 1 } },
      { $limit: 5 },
    ]);

    const stockByCategory = await Equipment.aggregate([
      { $match: { archived: false } },
      { $group: { _id: '$category', total: { $sum: '$availableQuantity' } } },
      { $sort: { total: -1 } },
    ]);

    return res.status(200).json({
      summary: {
        totalEquipment,
        totalPhysicalUnits,
        availableUnits,
        issuedUnits,
        damagedUnits,
        pendingMaintenance,
        overdueTransactions,
      },
      recentTransactions,
      lowStockEquipment,
      stockByCategory,
    });
  } catch (error) {
    next(error);
  }
};
