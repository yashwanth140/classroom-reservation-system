const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ POST /api/reservations – Book a room
router.post('/', (req, res) => {
  const {
    Reservation_type,
    User_SSN,
    Room_ID,
    Reservation_date,
    Start_time,
    End_time,
  } = req.body;

  if (!Reservation_type || !User_SSN || !Room_ID || !Reservation_date || !Start_time || !End_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const conflictCheck = `
    SELECT * FROM reservation 
    WHERE Room_ID = ? AND Reservation_date = ? AND Status = 'Approved'
      AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))
  `;

  db.query(
    conflictCheck,
    [Room_ID, Reservation_date, End_time, End_time, Start_time, Start_time],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Conflict check error' });
      if (results.length > 0) return res.status(409).json({ error: 'Room is already booked for this time' });

      const insertSQL = `
        INSERT INTO reservation (Reservation_type, User_SSN, Room_ID, Reservation_date, start_time, end_time, Status)
        VALUES (?, ?, ?, ?, ?, ?, 'Pending')
      `;

      db.query(
        insertSQL,
        [Reservation_type, User_SSN, Room_ID, Reservation_date, Start_time, End_time],
        (err) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          res.status(201).json({ message: 'Reservation submitted' });
        }
      );
    }
  );
});

// ✅ PUT /api/reservations/:id/approve – With Notification
router.put('/:id/approve', (req, res) => {
  const { id } = req.params;
  console.log('✅ Approve route triggered for ID:', id);  // ✅ Moved inside route

  const { Room_ID, Reservation_date, Start_time, End_time } = req.body;

  if (!Room_ID || !Reservation_date || !Start_time || !End_time) {
    return res.status(400).json({ error: 'Missing details to approve' });
  }

  const conflictCheck = `
    SELECT * FROM reservation 
    WHERE Room_ID = ? AND Reservation_date = ? AND Status = 'Approved'
      AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))
      AND Reservation_ID != ?
  `;

  db.query(
    conflictCheck,
    [Room_ID, Reservation_date, End_time, End_time, Start_time, Start_time, id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Conflict check error' });
      if (results.length > 0) return res.status(409).json({ error: 'Room conflict detected' });

      const approveSQL = `
        UPDATE reservation SET Status = 'Approved', Room_ID = ?, Reservation_date = ?, start_time = ?, end_time = ? 
        WHERE Reservation_ID = ?
      `;

      db.query(approveSQL, [Room_ID, Reservation_date, Start_time, End_time, id], (err) => {
        if (err) return res.status(500).json({ error: 'Update error' });

        const notificationSQL = `
          INSERT INTO notification (Message, Timestamp, isRead, User_SSN)
          SELECT ?, NOW(), 0, r.User_SSN
          FROM reservation r
          WHERE r.Reservation_ID = ?
        `;

        const message = `Your reservation #${id} has been approved.`;

        db.query(notificationSQL, [message, id], (notifErr) => {
          if (notifErr) {
            console.error('❌ Notification insert failed:', notifErr.sqlMessage || notifErr);
            return res.status(500).json({ error: 'Approved, but notification failed' });
          }

          console.log('✅ Notification inserted for reservation', id);
          res.json({ message: 'Reservation approved and user notified.' });
        });
      });
    }
  );
});


// ✅ PUT /api/reservations/:id/reject – With Notification
router.put('/:id/reject', (req, res) => {
  const { id } = req.params;

  const rejectSQL = `
    UPDATE reservation SET Status = 'Rejected' WHERE Reservation_ID = ?
  `;

  db.query(rejectSQL, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Rejection error' });

    const notifSQL = `
      INSERT INTO notification (Message, Timestamp, isRead, User_SSN)
      SELECT ?, NOW(), 0, r.User_SSN
      FROM reservation r
      WHERE r.Reservation_ID = ?
    `;
    const message = `Your reservation #${id} has been rejected.`;

    db.query(notifSQL, [message, id], (notifErr) => {
      if (notifErr) {
        console.error('❌ Rejection notification failed:', notifErr.sqlMessage || notifErr);
        return res.status(500).json({ error: 'Rejection success, but notification failed' });
      }

      res.json({ message: 'Reservation rejected and user notified.' });
    });
  });
});

// ✅ GET /api/reservations/pending – For Admin Panel
router.get('/pending', (req, res) => {
  const sql = `
    SELECT 
      r.Reservation_ID,
      r.Reservation_type,
      r.User_SSN,
      r.Room_ID,
      r.Reservation_date,
      r.start_time,
      r.end_time
    FROM reservation r
    JOIN user u ON r.User_SSN = u.User_SSN
    WHERE r.Status = 'Pending'
      AND r.Room_ID IS NOT NULL
      AND r.Reservation_date IS NOT NULL
      AND r.start_time IS NOT NULL
      AND r.end_time IS NOT NULL
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching pending reservations' });
    res.json(results);
  });
});

// ✅ GET /api/reservations – Dashboard View
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      r.Reservation_ID,
      u.User_Name AS name,
      r.Room_ID,
      r.Reservation_type,
      r.Reservation_date,
      r.start_time,
      r.end_time,
      r.Status,
      u.User_SSN as user_id
    FROM reservation r
    JOIN user u ON r.User_SSN = u.User_SSN
    ORDER BY r.Reservation_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// ✅ GET /api/reservations/available-rooms – Room Check with Capacity
router.get('/available-rooms', (req, res) => {
  const { date, start, end, minCapacity } = req.query;

  if (!date || !start || !end) {
    return res.status(400).json({ error: 'Missing date or time range' });
  }

  const sql = `
    SELECT * FROM rooms 
    WHERE Capacity >= ?
      AND Room_ID NOT IN (
        SELECT Room_ID FROM reservation 
        WHERE Reservation_date = ? AND Status = 'Approved'
          AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))
      )
  `;

  const values = [minCapacity || 0, date, end, end, start, start];

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("❌ Room availability error:", err.sqlMessage || err);
      return res.status(500).json({ error: 'Room check failed' });
    }

    res.status(200).json(results);
  });
});

module.exports = router;