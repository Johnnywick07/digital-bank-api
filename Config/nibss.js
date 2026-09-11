const axios = require('axios');

const NIBSS_BASE_URL = process.env.NIBSS_BASE_URL; // https://nibssbyphoenix.onrender.com

let cachedToken = null;

// Get a fresh token from NIBSS using apiKey + apiSecret
const getNibssToken = async () => {
    try {
        const response = await axios.post(`${NIBSS_BASE_URL}/api/auth/token`, {
            apiKey: process.env.NIBSS_API_KEY,
            apiSecret: process.env.NIBSS_API_SECRET
        });

        cachedToken = response.data.token;
        return cachedToken;
    } catch (error) {
        console.error('Error generating NIBSS token:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with NIBSS');
    }
};

// Returns an axios instance with the token attached, refreshing the token if needed
const getNibssClient = async (retry = true) => {
    if (!cachedToken) {
        await getNibssToken();
    }

    const client = axios.create({
        baseURL: `${NIBSS_BASE_URL}/api`,
        headers: {
            Authorization: `Bearer ${cachedToken}`,
            'Content-Type': 'application/json'
        }
    });

    // If a request using this client comes back 401, refresh the token once and retry
    client.interceptors.response.use(
        (res) => res,
        async (error) => {
            if (error.response?.status === 401 && retry) {
                await getNibssToken();
                const retryClient = await getNibssClient(false);
                return retryClient.request(error.config);
            }
            return Promise.reject(error);
        }
    );

    return client;
};

module.exports = { getNibssToken, getNibssClient };