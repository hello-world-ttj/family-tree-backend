const Family = require('./family.model');
const Person = require('../person/person.model');

// Get all families
const getAllFamilies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const families = await Family.find(query)
      .populate('members.person', 'firstName lastName')
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });
    
    const total = await Family.countDocuments(query);
    
    res.json({
      families,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get family by ID
const getFamilyById = async (req, res) => {
  try {
    const family = await Family.findById(req.params.id)
      .populate('members.person', 'firstName lastName birthDate deathDate gender')
      .populate('createdBy', 'name email')
      .populate('collaborators.user', 'name email');
    
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    
    res.json(family);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new family
const createFamily = async (req, res) => {
  try {
    const family = new Family({
      ...req.body,
      createdBy: req.user?.id
    });
    
    await family.save();
    await family.populate('members.person', 'firstName lastName');
    
    res.status(201).json(family);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update family
const updateFamily = async (req, res) => {
  try {
    const family = await Family.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('members.person', 'firstName lastName');
    
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    
    res.json(family);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete family
const deleteFamily = async (req, res) => {
  try {
    const family = await Family.findByIdAndDelete(req.params.id);
    
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    
    res.json({ message: 'Family deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add member to family
const addFamilyMember = async (req, res) => {
  try {
    const { personId, role } = req.body;
    const family = await Family.findById(req.params.id);
    
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    
    // Check if person exists
    const person = await Person.findById(personId);
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    // Check if person is already a member
    const existingMember = family.members.find(member => 
      member.person.equals(personId)
    );
    
    if (existingMember) {
      return res.status(400).json({ message: 'Person is already a family member' });
    }
    
    await family.addMember(personId, role);
    await family.populate('members.person', 'firstName lastName');
    
    res.json(family);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove member from family
const removeFamilyMember = async (req, res) => {
  try {
    const { personId } = req.params;
    const family = await Family.findById(req.params.id);
    
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    
    await family.removeMember(personId);
    await family.populate('members.person', 'firstName lastName');
    
    res.json(family);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
  addFamilyMember,
  removeFamilyMember
};