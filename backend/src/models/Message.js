const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  customerPhone: { type: String, required: true },
  type: { type: String, enum: ['REMINDER', 'OFFER', 'NUDGE', 'DIGEST'], required: true },
  messageText: { type: String, required: true },
  scheduledFor: { type: Date },
  status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
