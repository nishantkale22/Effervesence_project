const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per window
    message: { message: 'Too many login attempts. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = loginLimiter;
