const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const moment = require('moment-timezone'); // Import moment-timezone

// Define a custom token for logging the timestamp in Asia/Kolkata timezone
morgan.token('local-date', () => {
    return moment().tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss');
});

// Create a writable stream for access logs
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/log.log'), {
    flags: 'a' // Append new logs to the file
});

// Create a writable stream for error logs
const errorLogStream = fs.createWriteStream(path.join(__dirname, '../logs/error.log'), {
    flags: 'a'
});

// Custom Morgan log format with the `local-date` token
const httpLogger = morgan(
    ':remote-addr - :remote-user [:local-date] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms', 
    { stream: accessLogStream }
);

// Function to format date/time
const getFormattedDate = () => {
    return moment().tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss'); // Set your desired timezone
};

// Function to log errors to error.log
const logError = (error) => {
    const errorMessage = `${getFormattedDate()} - ${error.stack}\n`; // Use the formatted date/time
    fs.appendFileSync(path.join(__dirname, '../logs/error.log'), errorMessage);
};

// Function to log database activities (example)
const logDatabaseActivity = (message) => {
    const logMessage = `${getFormattedDate()} - ${message}\n`; // Use the formatted date/time
    fs.appendFileSync(path.join(__dirname, '../logs/DB.log'), logMessage);
};

module.exports = { httpLogger, logError, logDatabaseActivity };
