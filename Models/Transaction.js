const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderAccount: {
        type: String,
        required: true
    },
    receiverAccount: {
        type: String,
        required: true
    },
    receiverName: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['intra-bank', 'inter-bank'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        default: 'pending'
    },
    reference: {
        type: String,
        required: true,
        unique: true
    },
    narration: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);