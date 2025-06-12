const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  // description: {
  //   type: String
  // },
  members: [{
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: true
    },
    role: {
      type: String,
      enum: ['head', 'spouse', 'child', 'other'],
      default: 'other'
    },
    joinDate: {
      type: Date,
      default: Date.now
    }
  }],
  image: String,
  
  
  location: {
    city: String,
    state: String,
    country: String
  },
  
  // Family tree/genealogy info
  generation: {
    type: Number,
    default: 0
  },
  
  
  // Privacy and access
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 
}, {
  timestamps: true
});

// Instance methods
familySchema.methods.addMember = function(personId, role = 'other') {
  this.members.push({
    person: personId,
    role: role
  });
  return this.save();
};

familySchema.methods.removeMember = function(personId) {
  this.members = this.members.filter(member => 
    !member.person.equals(personId)
  );
  return this.save();
};

module.exports = mongoose.model('Family', familySchema);