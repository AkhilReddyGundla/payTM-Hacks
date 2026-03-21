const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  phone: { type: String, required: true },
  name: { type: String },
  tags: [{ type: String }],
  preferredTime: { type: String }
}, {
  timestamps: true
});

// A customer is uniquely identified by phone per merchant
customerSchema.index({ merchantId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
