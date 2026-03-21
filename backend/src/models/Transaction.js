const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  customerPhone: { type: String, required: true },
  customerName: { type: String },
  itemText: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PAID', 'PENDING'], required: true },
  dueDate: { type: Date },
  interestApplied: { type: Boolean, default: false },
  interestAmount: { type: Number, default: 0 },
  paymentLink: { type: String },
  reminderSent: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
