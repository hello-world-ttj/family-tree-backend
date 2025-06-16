const Transaction = require('./finance.model');
const Person = require('../person/person.model');

exports.listAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('memberId recipientId')
      .sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
};

exports.processRecharge = async (req, res) => {
  try {
    const { memberId, amount, transactionId } = req.body;
    const person = await Person.findById(memberId);
    
    if (!person) return res.status(404).json({ message: 'Person not found' });
    if (!person.isFinanceProgramMember) {
      return res.status(400).json({ message: 'Person is not a finance program member' });
    }

    const transaction = new Transaction({
      memberId,
      type: 'Recharge',
      amount,
      transactionId,
      status: 'Success'
    });
    await transaction.save();

    person.walletBalance += amount;
    person.lastRecharge = new Date();
    person.needsRechargeReminder = person.walletBalance < person.fixedWalletAmount;
    await person.save();

    res.status(201).json({
      transaction,
      walletBalance: person.walletBalance,
      needsRechargeReminder: person.needsRechargeReminder
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing recharge', error });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { status, reasonForRejection } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    transaction.status = status;
    if (status === 'Rejected') transaction.reasonForRejection = reasonForRejection;
    await transaction.save();

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error });
  }
};

exports.processMemorialContribution = async (req, res) => {
  try {
    const { deceasedId, contributionAmount } = req.body;
    
    const deceased = await Person.findById(deceasedId);
    if (!deceased || deceased.isAlive) {
      return res.status(400).json({ message: 'Invalid or living person specified' });
    }

    // Get all finance program members
    const members = await Person.find({ isFinanceProgramMember: true, isAlive: true });
    
    const transactions = [];
    for (const member of members) {
      if (member.walletBalance < contributionAmount) {
        member.needsRechargeReminder = true;
        await member.save();
        continue;
      }

      const transaction = new Transaction({
        memberId: member._id,
        recipientId: deceasedId,
        type: 'Memorial',
        amount: contributionAmount,
        transactionId: `MEM-${Date.now()}-${member._id}`,
        status: 'Success'
      });

      member.walletBalance -= contributionAmount;
      member.totalContribution += contributionAmount;
      member.needsRechargeReminder = member.walletBalance < member.fixedWalletAmount;
      await Promise.all([transaction.save(), member.save()]);
      
      transactions.push(transaction);
    }

    // Update deceased person's received contributions
    deceased.receivedContributions = (deceased.receivedContributions || 0) + (contributionAmount * transactions.length);
    await deceased.save();

    res.status(200).json({
      message: 'Memorial contributions processed',
      transactions,
      totalContributed: contributionAmount * transactions.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing memorial contribution', error });
  }
};

exports.joinFinanceProgram = async (req, res) => {
  try {
    const { personId, fixedWalletAmount } = req.body;
    
    const person = await Person.findById(personId);
    if (!person) return res.status(404).json({ message: 'Person not found' });
    
    person.isFinanceProgramMember = true;
    person.fixedWalletAmount = fixedWalletAmount;
    person.needsRechargeReminder = person.walletBalance < fixedWalletAmount;
    await person.save();

    res.status(200).json({
      message: 'Successfully joined finance program',
      person
    });
  } catch (error) {
    res.status(500).json({ message: 'Error joining finance program', error });
  }
};