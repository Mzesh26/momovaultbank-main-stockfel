const mongoose = require('mongoose');

const groupContributionSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavingsGroup',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'SZL'
  },
  contributionType: {
    type: String,
    enum: ['regular', 'bonus', 'penalty_refund'],
    default: 'regular'
  },
  paymentMethod: {
    type: String,
    enum: ['momo', 'bank_transfer', 'cash'],
    default: 'momo'
  },
  momoTransactionId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  description: String,
  processedAt: Date,
  failureReason: String
}, { timestamps: true });

module.exports = mongoose.model('GroupContribution', groupContributionSchema);
