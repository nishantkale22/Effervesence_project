require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const { httpLogger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 5000;

console.log(`Environment: ${process.env.NODE_ENV}`);

// Use middleware
app.use(httpLogger);
app.use(cors({
    origin: ['http://localhost:3000', 'https://your-production-url.com'], // Frontend origins
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, '/public')));

// Routes
// app.post( async(req,res)=>{
//     try {
//         const { id, task, assignedTo, resource } = req.body;
//         // Your logic for task assignment
//         res.status(200).send('Task assigned successfully');
//       } catch (error) {
//         console.error('Error in assigning task:', error);
//         res.status(500).send('Task assignment failed');
//       }
// });


app.use('/', require('./routes/root'));
app.use('/request',require('./routes/requestRoutes')) ;

app.use('/auth', require('./routes/authRoutes'));
app.use('/register', require('./routes/register'));
app.use('/user', require('./routes/userRoutes')); // Dashboard redirection routes
app.use('/task',require('./routes/taskRoutes')) ;


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

// Start the server with DB connection
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown handlers
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
