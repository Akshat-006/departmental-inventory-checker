import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    borrowerName: {
      type: String,
      required: true,
      trim: true,
    },
    borrowerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    borrowerRole: {
      type: String,
      enum: ['faculty', 'lab_assistant', 'admin'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    issueDate: {
      type: Date,
      default: null,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    actualReturnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'issued', 'returned', 'rejected', 'overdue'],
      default: 'pending',
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
