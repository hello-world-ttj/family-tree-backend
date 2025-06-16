const express = require('express');
const router = express.Router();
const financeController = require('./finance.controller');
const auth = require('../../middlewares/auth');

router.get('/', financeController.listAllTransactions);
router.post('/recharge', auth, financeController.processRecharge);
router.put('/:id', auth, financeController.updateTransaction);
router.post('/memorial', auth, financeController.processMemorialContribution);
router.post('/join', auth, financeController.joinFinanceProgram);

module.exports = router;