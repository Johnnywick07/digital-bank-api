const Account = require('../Models/Account');
const { getNibssClient } = require('../Config/nibss');

// Insert a BVN record
exports.insertBvn = async (req, res) => {
    try {
        const { bvn, firstName, lastName, dob, phone } = req.body;

        if (!bvn || !firstName || !lastName || !dob || !phone) {
            return res.status(400).json({ message: 'Please provide bvn, firstName, lastName, dob and phone' });
        }

        const client = await getNibssClient();
        const response = await client.post('/insertBvn', { bvn, firstName, lastName, dob, phone });

        res.status(201).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error creating BVN record',
            error: error.response?.data || error.message
        });
    }
};

// Validate a BVN
exports.validateBvn = async (req, res) => {
    try {
        const { bvn } = req.body;

        if (!bvn) {
            return res.status(400).json({ message: 'Please provide a bvn' });
        }

        const client = await getNibssClient();
        const response = await client.post('/validateBvn', { bvn });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error validating BVN',
            error: error.response?.data || error.message
        });
    }
};

// Insert a NIN record
exports.insertNin = async (req, res) => {
    try {
        const { nin, firstName, lastName, dob, phone } = req.body;

        if (!nin || !firstName || !lastName || !dob || !phone) {
            return res.status(400).json({ message: 'Please provide nin, firstName, lastName, dob and phone' });
        }

        const client = await getNibssClient();
        const response = await client.post('/insertNin', { nin, firstName, lastName, dob, phone });

        res.status(201).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error creating NIN record',
            error: error.response?.data || error.message
        });
    }
};

// Validate a NIN
exports.validateNin = async (req, res) => {
    try {
        const { nin } = req.body;

        if (!nin) {
            return res.status(400).json({ message: 'Please provide a nin' });
        }

        const client = await getNibssClient();
        const response = await client.post('/validateNin', { nin });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error validating NIN',
            error: error.response?.data || error.message
        });
    }
};

// Create a bank account for the logged-in user (after BVN/NIN is validated)
exports.createAccount = async (req, res) => {
    try {
        const { kycType, kycID, dob } = req.body;

        if (!kycType || !kycID || !dob) {
            return res.status(400).json({ message: 'Please provide kycType, kycID and dob' });
        }

        // check this user doesn't already have an account
        const existingAccount = await Account.findOne({ user: req.user.id });
        if (existingAccount) {
            return res.status(400).json({ message: 'User already has an account', account: existingAccount });
        }

        const client = await getNibssClient();
        const response = await client.post('/account/create', {
            kycType: kycType.toLowerCase(), // NIBSS requires lowercase "bvn"/"nin"
            kycID,
            dob
        });

        const nibssAccount = response.data.account;

        // save a local copy linked to this user
        const account = new Account({
            user: req.user.id,
            accountNumber: nibssAccount.accountNumber,
            accountName: nibssAccount.accountName,
            bankCode: nibssAccount.bankCode,
            kycType: nibssAccount.kycType,
            kycID: nibssAccount.kycID,
            balance: nibssAccount.balance,
            nibssAccountId: nibssAccount._id
        });

        await account.save();

        res.status(201).json({ message: 'Account created successfully', account });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error creating account',
            error: error.response?.data || error.message
        });
    }
};

// Get the logged-in user's account
exports.getMyAccount = async (req, res) => {
    try {
        const account = await Account.findOne({ user: req.user.id });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.status(200).json({ message: 'Account retrieved successfully', account });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving account', error: error.message });
    }
};