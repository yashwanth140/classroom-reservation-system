const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust path if needed

// Submit Feedback
router.post('/submit', (req, res) => {
  const { rating, comment, user_ssn } = req.body;
  const timestamp = new Date();

  const sql = `
    INSERT INTO feedback (Rating, Comment, Timestamp, User_SSN)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [rating, comment, timestamp, user_ssn], (err, result) => {
    if (err) {
      console.error('Error inserting feedback:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json({ message: 'Feedback submitted successfully' });
  });
});

module.exports = router;
