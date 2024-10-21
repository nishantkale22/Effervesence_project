const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const foundUser = await User.findOne({ email }).exec();
    if (!foundUser) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) return res.status(401).json({ message: 'Unauthorized: Invalid credentials' });

    const accessToken = jwt.sign(
        { UserInfo: { id: foundUser._id, role: foundUser.role, userType: foundUser.userType } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: foundUser._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
        accessToken,
        user: {
            _id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role,
            userType: foundUser.userType,
            department: foundUser.department,
            photo: foundUser.photo,
            phone: foundUser.phone,
            eventsRegistered: foundUser.eventsRegistered,
            demands: foundUser.demands,
            feedback: foundUser.feedback,
        },
    });
    console.log('correct creds')
});


// @desc Refresh Token
// @route GET /auth/refresh
// @access Public
const refresh = asyncHandler(async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized: No cookie found' });

    const refreshToken = cookies.jwt;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });

        const foundUser = await User.findById(decoded.id).exec();

        if (!foundUser) return res.status(401).json({ message: 'Unauthorized: User not found' });

        const accessToken = jwt.sign(
            { UserInfo: { id: foundUser._id, role: foundUser.role } },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ accessToken });
    });
});

// @desc Logout
// @route POST /auth/logout
// @access Public
const logout = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No content

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.json({ message: 'Successfully logged out' });
};

module.exports = { login, refresh, logout };