const Transaction = require('./finance.model');
const personModel = require('../person/person.model');

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('PersonId campaignId').sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { PersonId, campaignId, type, amount, transactionId } = req.body;
    const transaction = new Transaction({ PersonId, campaignId, type, amount, transactionId });
    await transaction.save();

    if (type === 'Wallet Recharge') {
      const Person = await personModel.findById(PersonId);
      Person.walletBalance += amount;
      Person.lastRecharge = new Date();
      Person.status = Person.walletBalance < 200 ? 'Low Balance' : 'Active';
      await Person.save();
    }

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error });
  }
};

exports.updateTransactionStatus = async (req, res) => {
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