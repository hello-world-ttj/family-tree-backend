const Request = require('./request.model');
const Person = require('../person/person.model');
const Family = require('../family/family.model');
const Relationship = require('../relationship/relationship.model');

// Create new membership request
const createMembershipRequest = async (req, res) => {
  try {
    const { personData, familyId, requestedRole, relationships } = req.body;

    // Validate family exists
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // If requesting head role and family has no members, allow it
    if (requestedRole === 'head' && family.members.length > 0) {
      return res.status(400).json({ message: 'Family already has members, cannot request head role' });
    }

    // Validate relationship person IDs
    if (relationships && Array.isArray(relationships)) {
      for (const rel of relationships) {
        if (rel.personId) {
          const person = await Person.findById(rel.personId);
          if (!person) {
            return res.status(404).json({ message: `Related person ${rel.personId} not found` });
          }
        }
      }
    }

    const request = new Request({
      personData,
      familyId,
      requestedRole,
      relationships,
      submittedBy: req.user.id
    });

    await request.save();
    await request.populate('familyId', 'name');
    await request.populate('submittedBy', 'name email');

    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all pending requests (for admin)
const getPendingRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, familyId } = req.query;
    
    let query = { status: 'pending' };
    if (familyId) {
      query.familyId = familyId;
    }

    const requests = await Request.find(query)
      .populate('familyId', 'name')
      .populate('submittedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Request.countDocuments(query);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Review membership request (approve/reject)
const reviewMembershipRequest = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update request status
    request.status = status;
    request.reviewedBy = req.user.id;
    request.reviewNotes = reviewNotes;
    request.reviewedAt = new Date();

    if (status === 'approved') {
      // Create person
      const person = await Person.create({
        ...request.personData,
        createdBy: request.submittedBy,
        familyId: request.familyId
      });

      // Add to family
      const family = await Family.findById(request.familyId);
      await family.addMember(person._id, request.requestedRole);

      // Create relationships
      if (request.relationships && Array.isArray(request.relationships)) {
        const relationshipPromises = request.relationships.map(async (rel) => {
          if (rel.personId) {
            const relationship = await Relationship.create({
              person1: person._id,
              person2: rel.personId,
              type: rel.type,
              startDate: rel.startDate,
              notes: rel.notes,
              marriageLocation: rel.marriageLocation,
              status: 'active',
              createdBy: req.user.id
            });

            // Update parent references for parent-child relationships
            if (rel.type === 'parent-child') {
              const parent = await Person.findById(rel.personId);
              if (parent) {
                if (parent.gender === 'Male') {
                  person.father = parent._id;
                } else if (parent.gender === 'Female') {
                  person.mother = parent._id;
                }
                await person.save();
              }
            }

            // Add relationship to both persons
            const otherPerson = await Person.findById(rel.personId);
            if (otherPerson) {
              otherPerson.relationships.push(relationship._id);
              await otherPerson.save();
            }
            person.relationships.push(relationship._id);
          }
        });

        await Promise.all(relationshipPromises);
        await person.save();
      }
    }

    await request.save();
    await request.populate('familyId', 'name');
    await request.populate('submittedBy reviewedBy', 'name email');

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createMembershipRequest,
  getPendingRequests,
  reviewMembershipRequest
};