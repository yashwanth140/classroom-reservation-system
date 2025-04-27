// routes/notification.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// backend/routes/notification.js
router.get('/', (req, res) => {
    const ssn = req.query.ssn;
    if (!ssn) return res.status(400).json({ error: 'Missing SSN' });
  
    const sql = `
      SELECT * FROM notification
      WHERE User_SSN = ?
      ORDER BY Timestamp DESC
    `;
    db.query(sql, [ssn], (err, results) => {
      if (err) {
        console.error('Notification fetch error:', err);
        return res.status(500).json({ error: 'Internal error' });
      }
      res.json(results);
    });
  });
  
module.exports = router;
