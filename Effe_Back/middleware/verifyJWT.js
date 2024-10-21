const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    // Check if the authorization header is present
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1];

    // Verify the token using the secret key
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            // Log the error for debugging purposes
            console.error('JWT verification error:', err);
            return res.status(403).json({ message: 'Forbidden' });
        }
        // Attach the user information to the request object
        req.user = decoded.UserInfo; // Ensure that 'UserInfo' matches your token's payload structure
        next(); // Call the next middleware or route handler
    });
};

module.exports = verifyJWT;