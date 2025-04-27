// server/routes/rooms.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/available-rooms?date=YYYY-MM-DD
router.get('/available-rooms', (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Missing date parameter' });

    const sql = `
        SELECT * FROM rooms 
        WHERE Room_ID NOT IN (
            SELECT Room_ID FROM reservation 
            WHERE Reservation_date = ? AND Status IN ('Approved', 'Pending')
        )
    `;

    db.query(sql, [date], (err, results) => {
        if (err) {
            console.error('Error fetching available rooms:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(results);
    });
});

module.exports = router;
