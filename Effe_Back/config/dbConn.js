const mongoose = require('mongoose');
const { logDatabaseActivity } = require('../middleware/logger');

const connectDB = async () => {
    try {
     await mongoose.connect(process.env.DATABASE_URI);


        logDatabaseActivity('Database connected successfully.');
        console.log('Database connected successfully.');
    } catch (error) {
        logDatabaseActivity(`Database connection error: ${error.message}`);
        console.error('Database connection failed:', error);
        throw error; // Re-throw to handle in `startServer`
    }

    // Handle events like disconnection
    mongoose.connection.on('disconnected', () => {
        logDatabaseActivity('MongoDB disconnected.');
        console.error('MongoDB disconnected.');
    });

    mongoose.connection.on('reconnected', () => {
        logDatabaseActivity('MongoDB reconnected.');
        console.log('MongoDB reconnected.');
    });
};

module.exports = connectDB;
