const Relationship = require('./relationship.model');
const Person = require('../person/person.model');

// Get all relationships
const getAllRelationships = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, personId } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (personId) {
      query.$or = [
        { person1: personId },
        { person2: personId }
      ];
    }
    
    const relationships = await Relationship.find(query)
      .populate('person1 person2', 'firstName lastName birthDate deathDate')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Relationship.countDocuments(query);
    
    res.json({
      relationships,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new relationship
const createRelationship = async (req, res) => {
  try {
    const { person1, person2, type } = req.body;
    
    // Check if both persons exist
    const [p1, p2] = await Promise.all([
      Person.findById(person1),
      Person.findById(person2)
    ]);
    
    if (!p1 || !p2) {
      return res.status(404).json({ message: 'One or both persons not found' });
    }
    
    // Check for existing relationship
    const existingRelationship = await Relationship.findOne({
      $or: [
        { person1, person2, type },
        { person1: person2, person2: person1, type }
      ]
    });
    
    if (existingRelationship) {
      return res.status(400).json({ message: 'Relationship already exists' });
    }
    
    const relationship = new Relationship({
      ...req.body,
      createdBy: req.user?.id
    });
    
    await relationship.save();
    await relationship.populate('person1 person2', 'firstName lastName');
    
    // Update parent references for parent-child relationships
    if (type === 'parent-child') {
      const parent = p1;
      const child = p2;
      
      if (parent.gender === 'Male') {
        child.father = parent._id;
      } else if (parent.gender === 'Female') {
        child.mother = parent._id;
      }
      
      await child.save();
    }
    
    res.status(201).json(relationship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update relationship
const updateRelationship = async (req, res) => {
  try {
    const relationship = await Relationship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('person1 person2', 'firstName lastName');
    
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    res.json(relationship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete relationship
const deleteRelationship = async (req, res) => {
  try {
    const relationship = await Relationship.findById(req.params.id);
    
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    // If it's a parent-child relationship, update the child's parent reference
    if (relationship.type === 'parent-child') {
      const child = await Person.findById(relationship.person2);
      if (child) {
        const parent = await Person.findById(relationship.person1);
        if (parent && parent.gender === 'Male') {
          child.father = undefined;
        } else if (parent && parent.gender === 'Female') {
          child.mother = undefined;
        }
        await child.save();
      }
    }
    
    await Relationship.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Relationship deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get relationships for a specific person
const getPersonRelationships = async (req, res) => {
  try {
    const { personId } = req.params;
    
    const relationships = await Relationship.find({
      $or: [
        { person1: personId },
        { person2: personId }
      ]
    }).populate('person1 person2', 'firstName lastName birthDate deathDate gender');
    
    // Group relationships by type
    const groupedRelationships = relationships.reduce((acc, rel) => {
      if (!acc[rel.type]) {
        acc[rel.type] = [];
      }
      
      acc[rel.type].push({
        relationship: rel,
        relatedPerson: rel.getOtherPerson(personId)
      });
      
      return acc;
    }, {});
    
    res.json(groupedRelationships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllRelationships,
  createRelationship,
  updateRelationship,
  deleteRelationship,
  getPersonRelationships
};