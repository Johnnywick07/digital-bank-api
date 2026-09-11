const Customer = require('../Models/Customer');
const { getNibssClient } = require('../Config/nibss');

// Onboard a customer by inserting + validating their BVN or NIN, then saving a verified record
exports.onboardCustomer = async (req, res) => {
    try {
        const { kycType, kycID, firstName, lastName, dob, phone } = req.body;

        if (!kycType || !kycID || !firstName || !lastName || !dob || !phone) {
            return res.status(400).json({ message: 'Please provide kycType, kycID, firstName, lastName, dob and phone' });
        }

        const type = kycType.toLowerCase();
        if (type !== 'bvn' && type !== 'nin') {
            return res.status(400).json({ message: 'kycType must be either bvn or nin' });
        }

        const client = await getNibssClient();

        // insert the record (ignore "already exists" conflicts since it may already be in NIBSS's sandbox)
        try {
            await client.post(type === 'bvn' ? '/insertBvn' : '/insertNin', {
                [type]: kycID,
                firstName,
                lastName,
                dob,
                phone
            });
        } catch (insertError) {
            if (insertError.response?.status !== 409) {
                throw insertError;
            }
        }

        // validate it
        const validateResponse = await client.post(type === 'bvn' ? '/validateBvn' : '/validateNin', {
            [type]: kycID
        });

        // save a verified customer record linked to this user
        const existingCustomer = await Customer.findOne({ user: req.user.id });
        if (existingCustomer) {
            existingCustomer.kycType = type;
            existingCustomer.kycID = kycID;
            existingCustomer.verified = true;
            await existingCustomer.save();

            return res.status(200).json({ message: 'Customer re-verified successfully', customer: existingCustomer });
        }

        const customer = new Customer({
            user: req.user.id,
            kycType: type,
            kycID,
            verified: true
        });

        await customer.save();

        res.status(201).json({ message: 'Customer onboarded successfully', customer, nibssData: validateResponse.data });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            message: 'Error onboarding customer',
            error: error.response?.data || error.message
        });
    }
};

// Get the logged-in user's onboarding/verification status
exports.getMyCustomerStatus = async (req, res) => {
    try {
        const customer = await Customer.findOne({ user: req.user.id });
        if (!customer) {
            return res.status(404).json({ message: 'No onboarding record found for this user' });
        }

        res.status(200).json({ message: 'Customer status retrieved', customer });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving customer status', error: error.message });
    }
};