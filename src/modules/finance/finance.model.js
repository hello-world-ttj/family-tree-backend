const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  // campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  type: { type: String, enum: ['Recharge', 'Contribution', 'Memorial'], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Success', 'Pending', 'Rejected'], default: 'Pending' },
  transactionId: { type: String, required: true },
  reasonForRejection: { type: String },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' }, 
});

module.exports = mongoose.model('Transaction', transactionSchema);