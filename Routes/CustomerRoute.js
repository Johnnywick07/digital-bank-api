const express = require('express');
const { protect } = require('../Middleware/auth');
const customerController = require('../Controllers/CustomerController');

const router = express.Router();

router.post('/onboard', protect, customerController.onboardCustomer);
router.get('/me', protect, customerController.getMyCustomerStatus);

module.exports = router;