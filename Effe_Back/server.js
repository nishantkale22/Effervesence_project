require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const { httpLogger } = require('./middleware/logger'); // Import HTTP logger
const errorHandler = require('./middleware/errorHandler'); // Import error handler
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const User = require('./models/User'); // Import User model

console.log(process.env.NODE_ENV);

// Use HTTP request logger middleware
app.use(httpLogger);
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve static files from the 'public' folder
app.use('/', express.static(path.join(__dirname, '/public')));

// Route handling
app.use('/', require('./routes/root'));

// Add the registration route
app.use('/register', require('./routes/register'));


// Handle 404 errors (when no route matches)
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

// Use the custom error handler middleware
app.use(errorHandler);

// Connect to the database and start the server
const startServer = async () => {
    try {
        await connectDB(); // Ensure the database is connected before starting the server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); // Exit the application if the database connection fails
    }
};

// Call the function to start the server
startServer();

// async function getAllUsers() {
//     try {
//       const users = await User.find();
//       console.log('All Users:', users);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     } finally {
//     //   mongoose.connection.close(); // Close connection after query
//     }
//   }
  
//   // Call the function
//   getAllUsers();
