const express = require('express');
const { protect } = require('../Middleware/auth');
const accountController = require('../Controllers/AccountController');

const router = express.Router();

router.post('/insert-bvn', protect, accountController.insertBvn);
router.post('/validate-bvn', protect, accountController.validateBvn);
router.post('/insert-nin', protect, accountController.insertNin);
router.post('/validate-nin', protect, accountController.validateNin);
router.post('/create', protect, accountController.createAccount);
router.get('/me', protect, accountController.getMyAccount);

module.exports = router;