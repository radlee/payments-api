const axios = require('axios');
const qs = require('qs');
const https = require('https');

let cachedToken = null;
let tokenExpirationTime = null;

const fetchAuthToken = async () => {
  if (cachedToken && tokenExpirationTime > Date.now()) {
    return cachedToken;
  }

  const agent = new https.Agent({
    rejectUnauthorized: false  // Disable SSL certificate validation (for local development with self-signed certs)
  });

  try {
    const response = await axios.post('https://localhost:3000/auth/token', qs.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      httpsAgent: agent // Use the custom HTTPS agent
    });

    cachedToken = response.data.access_token;
    tokenExpirationTime = Date.now() + (response.data.expires_in - 60) * 1000;
    return cachedToken;

  } catch (error) {
    console.error('Error fetching token:', error);
    throw new Error('Unable to fetch auth token');
  }
};

module.exports = { fetchAuthToken };
