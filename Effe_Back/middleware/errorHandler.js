// errorHandler.js
const { logError } = require('./logger'); // Import logError function

// Custom error handling middleware
const errorHandler = (err, req, res, next) => {
    logError(err); // Log the error
    console.error(err.stack); // Log to the console
    res.status(500).json({ message: 'Internal Server Error' });
};

module.exports = errorHandler;
