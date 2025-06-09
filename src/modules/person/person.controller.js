const Person = require('./person.model');
const Relationship = require('../relationship/relationship.model');
const Family = require('../family/family.model');
// Get all persons
const getAllPersons = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, gender, isAlive } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { middleName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (gender) query.gender = gender;
    if (isAlive !== undefined) query.isAlive = isAlive === 'true';
    
    const persons = await Person.find(query)
      .populate('father mother', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ lastName: 1, firstName: 1 });
    
    const total = await Person.countDocuments(query);
    
    res.json({
      persons,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get person by ID
const getPersonById = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id)
      .populate('father mother', 'firstName lastName birthDate deathDate');
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    // Get children
    const children = await person.getChildren();
    
    // Get siblings
    const siblings = await person.getSiblings();
    
    // Get spouses
    const spouses = await person.getSpouses();
    
    res.json({
      person,
      children,
      siblings,
      spouses: spouses.map(rel => ({
        relationship: rel,
        spouse: rel.getOtherPerson(person._id)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new person
// const createPerson = async (req, res) => {
//   try {
//     const personData = req.body;
//     const person = await Person.create(personData);

//     // Handle parent-child relationships automatically
//     if (personData.father) {
//       await Relationship.create({
//         person1: personData.father,
//         person2: person._id,
//         type: 'parent-child',
//         status: 'active'
//       });
//     }

//     if (personData.mother) {
//       await Relationship.create({
//         person1: personData.mother,
//         person2: person._id,
//         type: 'parent-child',
//         status: 'active'
//       });
//     }

//     // Handle multiple relationships if provided
//     if (personData.relationships && Array.isArray(personData.relationships)) {
//       const relationshipPromises = personData.relationships.map(rel => {
//         return Relationship.create({
//           person1: person._id,
//           person2: rel.personId,
//           type: rel.type,
//           startDate: rel.startDate,
//           endDate: rel.endDate,
//           status: rel.status || 'active',
//           notes: rel.notes
//         });
//       });
//       await Promise.all(relationshipPromises);
//     }

//     // Handle multiple spouses if provided
//     if (personData.spouses && Array.isArray(personData.spouses)) {
//       const spousePromises = personData.spouses.map(spouse => {
//         return Relationship.create({
//           person1: person._id,
//           person2: spouse.personId,
//           type: 'spouse',
//           startDate: spouse.marriageDate,
//           endDate: spouse.divorceDate,
//           status: spouse.status || 'active',
//           marriageLocation: spouse.marriageLocation,
//           notes: spouse.notes
//         });
//       });
//       await Promise.all(spousePromises);
//     }

//     // Handle other relationships
//     if (personData.relationships) {
//       const relationshipPromises = personData.relationships.map(rel => {
//         return Relationship.create({
//           person1: person._id,
//           person2: rel.personId,
//           type: rel.type,
//           startDate: rel.startDate,
//           status: 'active'
//         });
//       });
//       await Promise.all(relationshipPromises);
//     }

//     // Add to family if specified
//     if (personData.familyId) {
//       const family = await Family.findById(personData.familyId);
//       if (family) {
//         await family.addMember(person._id, personData.familyRole || 'other');
//       }
//     }

//     // Return created person with populated relationships
//     const createdPerson = await Person.findById(person._id)
//       .populate('father mother')
//       .exec();

//     res.status(201).json(createdPerson);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// const createPerson = async (req, res) => {
//   try {
//     const personData = req.body;
    
//     // Extract relationships data and remove from personData
//     const relationshipsData = personData.relationships || [];
//     const familyRole = personData.familyRole;
//     delete personData.relationships;
//     delete personData.familyRole;
    
//     // Create the person first
//     const person = await Person.create(personData);

//     // Handle parent-child relationships automatically
//     if (personData.father) {
//       const fatherRelationship = await Relationship.create({
//         person1: personData.father,
//         person2: person._id,
//         type: 'parent-child',
//         status: 'active'
//       });
//       person.relationships.push(fatherRelationship._id);
//     }

//     if (personData.mother) {
//       const motherRelationship = await Relationship.create({
//         person1: personData.mother,
//         person2: person._id,
//         type: 'parent-child',
//         status: 'active'
//       });
//       person.relationships.push(motherRelationship._id);
//     }

//     // Handle additional relationships
//     if (relationshipsData && Array.isArray(relationshipsData)) {
//       const relationshipPromises = relationshipsData.map(async (rel) => {
//         const relationship = await Relationship.create({
//           person1: person._id,
//           person2: rel.personId,
//           type: rel.type,
//           startDate: rel.startDate,
//           endDate: rel.endDate,
//           status: rel.status || 'active',
//           notes: rel.notes,
//           marriageLocation: rel.marriageLocation
//         });
        
//         // Add relationship to both persons
//         person.relationships.push(relationship._id);
        
//         // Also add to the other person
//         const otherPerson = await Person.findById(rel.personId);
//         if (otherPerson) {
//           otherPerson.relationships.push(relationship._id);
//           await otherPerson.save();
//         }
        
//         return relationship;
//       });
      
//       await Promise.all(relationshipPromises);
//     }

//     // Save person with relationship references
//     await person.save();

//     // Add to family if specified
//     if (personData.familyId) {
//       const family = await Family.findById(personData.familyId);
//       if (family) {
//         await family.addMember(person._id, familyRole || 'other');
//       }
//     }

//     // Return created person with populated relationships
//     const createdPerson = await Person.findById(person._id)
//       .populate('father mother', 'firstName lastName')
//       .populate('relationships')
//       .exec();

//     res.status(201).json(createdPerson);
//   } catch (error) {
//     console.error('Error creating person:', error);
//     res.status(400).json({ message: error.message });
//   }
// };

const createPerson = async (req, res) => {
  try {
    const personData = req.body;
    
    // Extract relationships data and remove from personData
    const relationshipsData = personData.relationships || [];
    const familyRole = personData.familyRole;
    const familyId = personData.familyId; // Store familyId before deleting
    
    delete personData.relationships;
    delete personData.familyRole;
    // Don't delete familyId yet as it might be needed for the Person model
    
    // Create the person first
    const person = await Person.create(personData);

    // Handle parent-child relationships automatically
    if (personData.father) {
      const fatherRelationship = await Relationship.create({
        person1: personData.father,
        person2: person._id,
        type: 'parent-child',
        status: 'active'
      });
      person.relationships.push(fatherRelationship._id);
    }

    if (personData.mother) {
      const motherRelationship = await Relationship.create({
        person1: personData.mother,
        person2: person._id,
        type: 'parent-child',
        status: 'active'
      });
      person.relationships.push(motherRelationship._id);
    }

    // Handle additional relationships
    if (relationshipsData && Array.isArray(relationshipsData)) {
      const relationshipPromises = relationshipsData.map(async (rel) => {
        const relationship = await Relationship.create({
          person1: person._id,
          person2: rel.personId,
          type: rel.type,
          startDate: rel.startDate,
          endDate: rel.endDate,
          status: rel.status || 'active',
          notes: rel.notes,
          marriageLocation: rel.marriageLocation
        });
        
        // Add relationship to both persons
        person.relationships.push(relationship._id);
        
        // Also add to the other person
        const otherPerson = await Person.findById(rel.personId);
        if (otherPerson) {
          otherPerson.relationships.push(relationship._id);
          await otherPerson.save();
        }
        
        return relationship;
      });
      
      await Promise.all(relationshipPromises);
    }

    // Save person with relationship references
    await person.save();

    // Add to family if specified
    if (familyId) {
      const family = await Family.findById(familyId);
      if (family) {
        await family.addMember(person._id, familyRole || 'other');
      }
    }

    // Return created person with populated relationships
    const createdPerson = await Person.findById(person._id)
      .populate('father mother', 'firstName lastName')
      .populate('relationships')
      .exec();

    res.status(201).json(createdPerson);
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(400).json({ message: error.message });
  }
};
// Update person
const updatePerson = async (req, res) => {
  try {
    const person = await Person.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('father mother', 'firstName lastName');
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    res.json(person);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete person
const deletePerson = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    
    // Remove all relationships involving this person
    await Relationship.deleteMany({
      $or: [
        { person1: person._id },
        { person2: person._id }
      ]
    });
    
    // Update children to remove parent references
    await Person.updateMany(
      { $or: [{ father: person._id }, { mother: person._id }] },
      { $unset: { father: "", mother: "" } }
    );
    
    await Person.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Person deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get person's ancestry tree
const getAncestryTree = async (req, res) => {
  try {
    const { id } = req.params;
    const { generations = 3 } = req.query;
    
    const buildAncestryTree = async (personId, currentGen = 0) => {
      if (currentGen >= generations) return null;
      
      const person = await Person.findById(personId)
        .select('firstName lastName birthDate deathDate gender');
      
      if (!person) return null;
      
      const father = person.father ? await buildAncestryTree(person.father, currentGen + 1) : null;
      const mother = person.mother ? await buildAncestryTree(person.mother, currentGen + 1) : null;
      
      return {
        ...person.toObject(),
        father,
        mother,
        generation: currentGen
      };
    };
    
    const ancestryTree = await buildAncestryTree(id);
    res.json(ancestryTree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get person's descendant tree
const getDescendantTree = async (req, res) => {
  try {
    const { id } = req.params;
    const { generations = 3 } = req.query;
    
    const buildDescendantTree = async (personId, currentGen = 0) => {
      if (currentGen >= generations) return null;
      
      const person = await Person.findById(personId)
        .select('firstName lastName birthDate deathDate gender');
      
      if (!person) return null;
      
      const children = await Person.find({
        $or: [{ father: personId }, { mother: personId }]
      }).select('_id');
      
      const childrenTrees = await Promise.all(
        children.map(child => buildDescendantTree(child._id, currentGen + 1))
      );
      
      return {
        ...person.toObject(),
        children: childrenTrees.filter(child => child !== null),
        generation: currentGen
      };
    };
    
    const descendantTree = await buildDescendantTree(id);
    res.json(descendantTree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  getAncestryTree,
  getDescendantTree
};