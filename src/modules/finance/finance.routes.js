const express = require('express');
const router = express.Router();
const transactionController = require('./finance.controller');

router.get('/', transactionController.getAllTransactions);
router.post('/', transactionController.createTransaction);
router.put('/:id/status', transactionController.updateTransactionStatus);

module.exports = router;