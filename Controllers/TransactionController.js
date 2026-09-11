const { v4: uuidv4 } = require('uuid');
const Account = require('../Models/Account');
const Transaction = require('../Models/Transaction');
const { getNibssClient } = require('../Config/nibss');

// Name enquiry - verify recipient account details before transferring
exports.nameEnquiry = async (req, res) => {
    try {
        const { accountNumber, bankCode } = req.body;

        if (!accountNumber) {
            return res.status(400).json({ message: 'Please provide an accountNumber' });
        }

        const client = await getNibssClient();
        const response = await client.get('/accounts', { params: { accountNumber, bankCode } });

        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error performing name enquiry',
            error: error.response?.data || error.message
        });
    }
};

// Funds transfer (intra or inter-bank)
exports.transfer = async (req, res) => {
    try {
        const { receiverAccount, receiverBankCode, amount, narration } = req.body;

        if (!receiverAccount || !amount) {
            return res.status(400).json({ message: 'Please provide receiverAccount and amount' });
        }

        const senderAccount = await Account.findOne({ user: req.user.id });
        if (!senderAccount) {
            return res.status(404).json({ message: 'Sender account not found' });
        }

        if (senderAccount.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const reference = uuidv4();
        const client = await getNibssClient();

        // NIBSS expects "from", "to", "amount"
        const response = await client.post('/transfer', {
            from: senderAccount.accountNumber,
            to: receiverAccount,
            amount
        });

        senderAccount.balance -= amount;
        await senderAccount.save();

        const transaction = new Transaction({
            user: req.user.id,
            senderAccount: senderAccount.accountNumber,
            receiverAccount,
            amount,
            type: receiverBankCode && receiverBankCode !== senderAccount.bankCode ? 'inter-bank' : 'intra-bank',
            status: 'successful',
            reference,
            narration
        });

        await transaction.save();

        res.status(200).json({ message: 'Transfer successful', transaction, nibssResponse: response.data });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error processing transfer',
            error: error.response?.data || error.message
        });
    }
};

// Check balance
exports.checkBalance = async (req, res) => {
    try {
        const account = await Account.findOne({ user: req.user.id });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.status(200).json({ accountNumber: account.accountNumber, balance: account.balance });
    } catch (error) {
        res.status(500).json({ message: 'Error checking balance', error: error.message });
    }
};

// Check transaction status
exports.checkTransactionStatus = async (req, res) => {
    try {
        const { reference } = req.params;

        const transaction = await Transaction.findOne({ reference, user: req.user.id });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json({ message: 'Transaction status retrieved', transaction });
    } catch (error) {
        res.status(500).json({ message: 'Error checking transaction status', error: error.message });
    }
};

// Get logged-in user's transaction history (data isolation - only their own)
exports.getMyTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ message: 'Transactions retrieved successfully', transactions });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving transactions', error: error.message });
    }
};