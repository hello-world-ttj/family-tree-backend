const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  raisedSoFar: { type: Number, default: 0 },
  donors: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  category: { type: String, enum: ['CSR', 'ZAKATH'], required: true },
  description: { type: String },
  media: { type: String }, 
  status: { type: String, enum: ['Active', 'Transferred'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Campaign', campaignSchema);