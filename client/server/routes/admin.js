const express = require('express');
const router = express.Router();
const db = require('../db');

// ==========================
// ✅ Admin Login Route
// ==========================
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log('🔐 Admin login attempt:', username); // debug log

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    const sql = `SELECT * FROM admin WHERE username = ? AND password = ?`;

    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (results.length === 0) {
            console.log('❌ Invalid credentials');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('✅ Admin authenticated:', results[0]);
        res.status(200).json({
            message: 'Login successful',
            admin: results[0],
            success: true
        });
    });
});


// ==========================
// ✅ Update Reservation Status + Notify User
// ==========================
router.patch('/reservations/status', (req, res) => {
    const { reservationId, newStatus, userId } = req.body;

    if (!reservationId || !newStatus || !userId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const updateStatusQuery = `
        UPDATE reservation
        SET Status = ?
        WHERE Reservation_ID = ?
    `;

    db.query(updateStatusQuery, [newStatus, reservationId], (err, result) => {
        if (err) {
            console.error('❌ Error updating reservation status:', err);
            return res.status(500).json({ message: 'Error updating reservation' });
        }

        console.log(`✅ Reservation ${reservationId} updated to '${newStatus}'`);

        // ✅ Send notification to user
        const message = `Your reservation #${reservationId} has been ${newStatus.toLowerCase()}.`;
        const insertNotificationQuery = `
            INSERT INTO notification (User_ID, Message, Timestamp, isRead)
            VALUES (?, ?, NOW(), 0)
        `;

        db.query(insertNotificationQuery, [userId, message], (err2, result2) => {
            if (err2) {
                console.error('❌ Notification insert failed:', err2);
                return res.status(500).json({ message: 'Status updated but notification failed' });
            }

            console.log(`🔔 Notification sent to User ${userId}`);
            res.status(200).json({ message: 'Reservation updated and user notified.' });
        });
    });
});

module.exports = router;
