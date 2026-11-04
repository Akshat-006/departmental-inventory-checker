import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: ['Computer', 'Peripheral', 'Networking', 'Electronics', 'Laboratory Instrument', 'Furniture', 'Other'],
      default: 'Other',
    },
    manufacturer: {
      type: String,
      default: '',
    },
    modelNumber: {
      type: String,
      default: '',
    },
    serialNumber: {
      type: String,
      default: '',
    },
    laboratory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory',
      default: null,
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    condition: {
      type: String,
      enum: ['new', 'good', 'warning', 'damaged', 'maintenance'],
      default: 'good',
    },
    minStockThreshold: {
      type: Number,
      default: 1,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    purchaseCost: {
      type: Number,
      min: 0,
      default: 0,
    },
    supplier: {
      type: String,
      default: '',
    },
    warrantyExpiry: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: '',
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

equipmentSchema.pre('save', function (next) {
  if (this.availableQuantity > this.totalQuantity) {
    return next(new Error('Available quantity cannot be greater than total quantity.'));
  }
  next();
});

const Equipment = mongoose.model('Equipment', equipmentSchema);
export default Equipment;
