// server/index.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// API route handlers
const roomsRoute = require('./routes/rooms');
const reservationsRoute = require('./routes/reservations');
const adminRoute = require('./routes/admin');
const userRoute = require('./routes/User')
const feedbackRoutes = require('./routes/feedback');
const notificationRoutes = require('./routes/notification');


// Route bindings
app.use('/api', roomsRoute); // Handles /api/available-rooms
app.use('/api/admin', adminRoute);
app.use('/api/reservations', reservationsRoute);
app.use('/api/user', userRoute); // Handles user login and registration
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/', (req, res) => {
    res.send('Classroom Reservation API is up and running!');
});

// Server startup
app.listen(5000, () => {
    console.log('✅ Server running on http://localhost:5000');
});
