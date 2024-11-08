require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const { httpLogger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Setup environment and app
const PORT = process.env.PORT || 5000;
const app = express();
console.log(`Environment: ${process.env.NODE_ENV}`);

// Middleware setup
app.use(httpLogger);
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, '/public')));

// Wrap the app in an HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
});

// Pass io to routes needing real-time updates
app.use('/', require('./routes/root'));
app.use('/request', require('./routes/requestRoutes')(io)); // Routes with io dependency
app.use('/auth', require('./routes/authRoutes'));
app.use('/register', require('./routes/register'));
app.use('/user', require('./routes/userRoutes')); // Dashboard redirection routes
app.use('/task', require('./routes/taskRoutes'));

// 404 Not Found handler
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

// Error handler middleware
app.use(errorHandler);

// Socket.io events
io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    // Listen for a join event with the user's ID
    socket.on('joinRoom', (userId) => {
        socket.join(userId);
    });

    // Handle notification events
    socket.on('sendNotification', (notification) => {
        io.to(notification.userId).emit('receiveNotification', notification);
    });

    socket.on('sendCount', (notification) => {
        io.to(notification.userId).emit('unreadCount');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});


// Connect to the database and start the server
const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown for the server
process.on('SIGINT', async () => {
    console.log('SIGINT received, closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    await mongoose.connection.close();
    process.exit(0);
});
