const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  reason: [{
    title: { type: String },
    description: { type: String },
    media: { type: String },
  }],
  targetAmount: { type: Number, required: true },
  donatedAmount: { type: Number, default: 0 },
  doatedMembers: [{
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    amount: { type: Number, required: true, min: 0 }
  }],
  deadline: { type: Date, required: true },
  tagType: { type: String, enum: ['CSR', 'ZAKATH'], required: true },
  status: { type: String, enum: ['Active', 'Transferred'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Campaign', campaignSchema);