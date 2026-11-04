import mongoose from 'mongoose';

const maintenanceRecordSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    issueType: {
      type: String,
      enum: ['damaged', 'malfunctioning', 'preventive', 'inspection', 'missing'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reportedBy: {
      type: String,
      required: true,
      trim: true,
    },
    reportedDate: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['reported', 'in_progress', 'resolved', 'cancelled'],
      default: 'reported',
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    repairCost: {
      type: Number,
      min: 0,
      default: 0,
    },
    resolutionDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

maintenanceRecordSchema.index({ status: 1, equipment: 1 });

const MaintenanceRecord = mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
export default MaintenanceRecord;
