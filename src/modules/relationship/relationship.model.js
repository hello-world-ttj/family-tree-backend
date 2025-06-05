const mongoose = require('mongoose');

const relationshipSchema = new mongoose.Schema({
  person1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    required: true
  },
  person2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    required: true
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
  
  // Relationship details
  startDate: Date, // Marriage date, adoption date, etc.
  endDate: Date,   // Divorce date, death, etc.
  status: {
    type: String,
    enum: ['active', 'ended', 'unknown'],
    default: 'active'
  },
  
  // Additional info
  notes: String,
  isConfirmed: {
    type: Boolean,
    default: true
  },
  
  // For marriages
  marriageLocation: String,
  divorceReason: String,
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Prevent duplicate relationships
relationshipSchema.index({ person1: 1, person2: 1, type: 1 }, { unique: true });

// Instance methods
relationshipSchema.methods.getOtherPerson = function(personId) {
  return this.person1.equals(personId) ? this.person2 : this.person1;
};

module.exports = mongoose.model('Relationship', relationshipSchema);