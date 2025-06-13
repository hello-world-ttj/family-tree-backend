const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  birthDate: {
    type: Date
  },
  deathDate: {
    type: Date
  },
  birthPlace: {
    type: String,
    trim: true
  },
  occupation: {
    type: String,
    trim: true
  },
  biography: {
    type: String
  },
  photos: [{
    url: String,
    caption: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Direct family references for quick access
  father: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  },
  mother: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  },
  familyId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family'
  }],
  relationships: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship'
  }],
  // Contact information
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  walletBalance: { type: Number, default: 0 },
  lastRecharge: { type: Date },
  lastRechargeAmount: { type: Number, default: 0 },
totoalContribution: { type: Number, default: 0 },
  lastRenewed: { type: Date },
  nextRenewal: { type: Date },
  reminderThreshold: { type: Number },
  receivedContributions: { type: Number, default: 0 },
  fixedWalletAmount: { type: Number, default: 0 },
  needsRechargeReminder: { type: Boolean, default: false },
  isFinanceProgramMember: { type: Boolean, default: false },
  // Metadata
  isAlive: {
    type: Boolean,
    default: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for full name
personSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`;
});

// Virtual for age
personSchema.virtual('age').get(function() {
  if (!this.birthDate) return null;
  const endDate = this.deathDate || new Date();
  return Math.floor((endDate - this.birthDate) / (365.25 * 24 * 60 * 60 * 1000));
});

// Instance methods
personSchema.methods.getChildren = function() {
  return mongoose.model('Person').find({
    $or: [
      { father: this._id },
      { mother: this._id }
    ]
  });
};

personSchema.methods.getSiblings = function() {
  return mongoose.model('Person').find({
    $and: [
      { _id: { $ne: this._id } },
      {
        $or: [
          { father: this.father, father: { $ne: null } },
          { mother: this.mother, mother: { $ne: null } }
        ]
      }
    ]
  });
};

personSchema.methods.getSpouses = function() {
  return mongoose.model('Relationship').find({
    $and: [
      { type: 'spouse' },
      {
        $or: [
          { person1: this._id },
          { person2: this._id }
        ]
      }
    ]
  }).populate('person1 person2');
};

module.exports = mongoose.model('Person', personSchema);