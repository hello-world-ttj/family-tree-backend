const Family = require('./family.model');
const Person = require('../person/person.model');
const response_handler = require('../../helpers/responseHandler');

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
    const outputJson={
      families,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }
    
    return response_handler(res, 200, 'Families fetched successfully', outputJson);
  } catch (error) {
    return response_handler(res, 500, 'Error fetching families', error);
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
      return response_handler(res, 404, 'Family not found');
    }
    
    return response_handler(res, 200, 'Family fetched successfully', family);
  } catch (error) {
    return response_handler(res, 500, 'Error fetching family', error);
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
    
    return response_handler(res, 201, 'Family created successfully', family);
  } catch (error) {
    return response_handler(res, 400, 'Error creating family', error);
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
      return response_handler(res, 404, 'Family not found');
    }
    
    return response_handler(res, 200, 'Family updated successfully', family);
  } catch (error) {
    return response_handler(res, 400, 'Error updating family', error);
  }
};

// Delete family
const deleteFamily = async (req, res) => {
  try {
    const family = await Family.findByIdAndDelete(req.params.id);
    
    if (!family) {
      return response_handler(res, 404, 'Family not found');
    }
    
    return response_handler(res, 200, 'Family deleted successfully');
  } catch (error) {
    return response_handler(res, 500, 'Error deleting family', error);
  }
};

// Add member to family
const addFamilyMember = async (req, res) => {
  try {
    const { personId, role } = req.body;
    const family = await Family.findById(req.params.id);
    
    if (!family) {
        return response_handler(res, 404, 'Family not found');
    }
    
    // Check if person exists
    const person = await Person.findById(personId);
    if (!person) {
      return response_handler(res, 404, 'Person not found');
    }
    
    // Check if person is already a member
    const existingMember = family.members.find(member => 
      member.person.equals(personId)
    );
    
    if (existingMember) {
      return response_handler(res, 400, 'Person is already a family member');
    }
    
    await family.addMember(personId, role);
    await family.populate('members.person', 'firstName lastName');
    
    return response_handler(res, 200, 'Family member added successfully', family);
  } catch (error) {
    return response_handler(res, 400, 'Error adding family member', error);
  }
};

// Remove member from family
const removeFamilyMember = async (req, res) => {
  try {
    const { personId } = req.params;
    const family = await Family.findById(req.params.id);
    
    if (!family) {
      return response_handler(res, 404, 'Family not found');
    }
    
    await family.removeMember(personId);
    await family.populate('members.person', 'firstName lastName');
    
    return response_handler(res, 200, 'Family member removed successfully', family);
  } catch (error) {
    return response_handler(res, 400, 'Error removing family member', error);
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