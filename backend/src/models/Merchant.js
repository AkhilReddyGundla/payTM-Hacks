const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  interestEnabled: { type: Boolean, default: false },
  interestRate: { type: Number, default: 0 },
  reminderTime: { type: String, default: '09:00' },
  digestTime: { type: String, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Merchant', merchantSchema);
