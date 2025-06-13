const Person = require('./person.model');
const Relationship = require('../relationship/relationship.model');
const Family = require('../family/family.model');
const Campaign = require('../campaign/campaign.model');
const Transaction = require('../finance/finance.model');

// Get all persons
const getAllPersons = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, gender, isAlive } = req.query;
    
    let query = {};
    
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
    
    const children = await person.getChildren();
    const siblings = await person.getSiblings();
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

// Create person
const createPerson = async (req, res) => {
  try {
    const personData = req.body;
    
    const relationshipsData = personData.relationships || [];
    const familyRole = personData.familyRole;
    const familyId = personData.familyId;
    
    delete personData.relationships;
    delete personData.familyRole;
    
    const person = await Person.create(personData);

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
        
        person.relationships.push(relationship._id);
        
        const otherPerson = await Person.findById(rel.personId);
        if (otherPerson) {
          otherPerson.relationships.push(relationship._id);
          await otherPerson.save();
        }
        
        return relationship;
      });
      
      await Promise.all(relationshipPromises);
    }

    await person.save();

    if (familyId) {
      const family = await Family.findById(familyId);
      if (family) {
        await family.addMember(person._id, familyRole || 'other');
      }
    }

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
    
    await Relationship.deleteMany({
      $or: [
        { person1: person._id },
        { person2: person._id }
      ]
    });
    
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

// Add wallet amount
 const addWalletAmount = async (req, res) => {
  try {
    const { personId, amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const person = await Person.findById(personId);
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    if (!person.isFinanceProgramMember) {
      return res.status(400).json({ message: 'Person is not a finance program member' });
    }

    const transaction = new Transaction({
      memberId: personId,
      type: 'Recharge',
      amount,
      transactionId: `RECH-${Date.now()}-${personId}`,
      status: 'Success'
    });

    person.walletBalance += amount;
    person.lastRecharge = new Date();
    person.lastRechargeAmount = amount;
    person.needsRechargeReminder = person.walletBalance < person.fixedWalletAmount;

    await Promise.all([person.save(), transaction.save()]);

    res.status(200).json({
      message: 'Wallet amount added successfully',
      walletBalance: person.walletBalance,
      lastRecharge: person.lastRecharge,
      needsRechargeReminder: person.needsRechargeReminder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Donate to campaign from wallet
// const donateFromWallet = async (req, res) => {
//   try {
//     const { personId, campaignId, amount } = req.body;

//     if (!amount || amount <= 0) {
//       return res.status(400).json({ message: 'Invalid donation amount' });
//     }

//     const person = await Person.findById(personId);
//     if (!person) {
//       return res.status(404).json({ message: 'Person not found' });
//     }

//     const campaign = await Campaign.findById(campaignId);
//     if (!campaign) {
//       return res.status(404).json({ message: 'Campaign not found' });
//     }

//     if (campaign.status !== 'Active') {
//       return res.status(400).json({ message: 'Campaign is not active' });
//     }

//     if (person.walletBalance < amount) {
//       return res.status(400).json({ message: 'Insufficient wallet balance' });
//     }

//     // Deduct from wallet
//     person.walletBalance -= amount;
//     person.totoalContribution += amount;

//     // Add donation to campaign
//     campaign.doatedMembers.push({
//       member: personId,
//       amount
//     });
//     campaign.donatedAmount += amount;

//     // Check if target amount is reached
//     if (campaign.donatedAmount >= campaign.targetAmount) {
//       campaign.status = 'Transferred';
//     }

//     // Check if wallet balance is below reminder threshold
//     const needsReminder = person.reminderThreshold && person.walletBalance <= person.reminderThreshold;

//     await Promise.all([person.save(), campaign.save()]);

//     res.status(200).json({
//       message: 'Donation successful',
//       walletBalance: person.walletBalance,
//       campaignDonatedAmount: campaign.donatedAmount,
//       needsReminder
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const donateFromWallet = async (req, res) => {
  try {
    const { personId, campaignId, amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid donation amount' });
    }

    const person = await Person.findById(personId);
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    if (!person.isFinanceProgramMember) {
      return res.status(400).json({ message: 'Person is not a finance program member' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status !== 'Active') {
      return res.status(400).json({ message: 'Campaign is not active' });
    }

    if (person.walletBalance < amount) {
      person.needsRechargeReminder = true;
      await person.save();
      return res.status(400).json({ 
        message: 'Insufficient wallet balance',
        needsRechargeReminder: true
      });
    }

    const transaction = new Transaction({
      memberId: personId,
      campaignId,
      type: 'Contribution',
      amount,
      transactionId: `CONT-${Date.now()}-${personId}`,
      status: 'Success'
    });

    person.walletBalance -= amount;
    person.totalContribution += amount;
    person.needsRechargeReminder = person.walletBalance < person.fixedWalletAmount;

    campaign.doatedMembers.push({
      member: personId,
      amount
    });
    campaign.donatedAmount += amount;

    if (campaign.donatedAmount >= campaign.targetAmount) {
      campaign.status = 'Transferred';
    }

    await Promise.all([person.save(), campaign.save(), transaction.save()]);

    res.status(200).json({
      message: 'Donation successful',
      walletBalance: person.walletBalance,
      campaignDonatedAmount: campaign.donatedAmount,
      needsRechargeReminder: person.needsRechargeReminder
    });
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
  getDescendantTree,
  addWalletAmount,
  donateFromWallet
};