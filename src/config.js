require('dotenv').config();

module.exports = {
    LARAVEL_API_URL: process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api',
    SCRAPE_INTERVAL: process.env.SCRAPE_INTERVAL || 300000,
    TARGET_URL: process.env.TARGET_URL || 'https://example.com/news'
};