const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    accountName: {
        type: String,
        required: true
    },
    bankCode: {
        type: String,
        required: true
    },
    kycType: {
        type: String,
        enum: ['bvn', 'nin'],
        required: true
    },
    kycID: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 15000
    },
    nibssAccountId: {
        type: String // the _id NIBSS returned for this account
    }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema); 