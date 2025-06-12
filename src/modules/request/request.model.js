const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  personData: {
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
    birthPlace: {
      type: String,
      trim: true
    },
    deathDate: {
    type: Date
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
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  requestedRole: {
    type: String,
    enum: ['head', 'spouse', 'child', 'other'],
    default: 'other'
  },
  relationships: [{
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person'
    },
    type: {
      type: String,
      enum: [
        'spouse', 'parent-child', 'sibling',
        'grandparent-grandchild', 'uncle-nephew',
        'aunt-niece', 'cousin', 'other'
      ],
      required: true
    },
    startDate: Date,
    notes: String,
    marriageLocation: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  reviewedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Request', requestSchema);