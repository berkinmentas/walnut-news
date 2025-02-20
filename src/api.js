const axios = require('axios');
const config = require('./config');

async function sendToLaravel(newsData) {
    try {
        const response = await axios.post(`${config.LARAVEL_API_URL}/callback`, newsData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-KEY': process.env.API_TOKEN
            }
        });
        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Full API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
        });
        throw new Error(`API Error: ${error.message}`);
    }
}

module.exports = { sendToLaravel };