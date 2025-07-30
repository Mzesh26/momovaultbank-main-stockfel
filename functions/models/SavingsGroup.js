const mongoose = require('mongoose');

const savingsGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'SZL'
  },
  maxMembers: {
    type: Number,
    required: true,
    min: 2
  },
  currentMembers: {
    type: Number,
    default: 0
  },
  minimumContribution: {
    type: Number,
    required: true,
    min: 0
  },
  contributionFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    totalContributed: {
      type: Number,
      default: 0
    },
    lastContribution: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  rules: {
    allowEarlyWithdrawal: {
      type: Boolean,
      default: false
    },
    penaltyPercentage: {
      type: Number,
      default: 10
    },
    requiresApproval: {
      type: Boolean,
      default: true
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SavingsGroup', savingsGroupSchema);
