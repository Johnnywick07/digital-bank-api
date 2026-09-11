const express = require('express');
const { protect } = require('../Middleware/auth');
const transactionController = require('../Controllers/TransactionController');

const router = express.Router();

router.post('/name-enquiry', protect, transactionController.nameEnquiry);
router.post('/transfer', protect, transactionController.transfer);
router.get('/balance', protect, transactionController.checkBalance);
router.get('/status/:reference', protect, transactionController.checkTransactionStatus);
router.get('/history', protect, transactionController.getMyTransactions);

module.exports = router;