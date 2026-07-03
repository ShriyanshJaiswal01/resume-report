require('dotenv').config();
const app = require('./src/app');
const connectToDB = require('./src/config/database');
const mongoose = require('mongoose');
const { closeBrowser } = require('./src/services/puppeteer.service');

connectToDB();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown handler
async function gracefulShutdown(signal) {
    console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(() => {
        console.log('[Server] HTTP server closed.');
    });

    try {
        // Close Puppeteer browser instance if active
        await closeBrowser();
        console.log('[Puppeteer] Cleaned up browser resources.');
    } catch (err) {
        console.error('[Puppeteer] Error during browser cleanup:', err);
    }

    try {
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('[Database] MongoDB connection closed.');
    } catch (err) {
        console.error('[Database] Error closing MongoDB connection:', err);
    }

    console.log('[Server] Graceful shutdown completed. Exiting.');
    process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));