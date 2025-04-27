// server/routes/user.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ User Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const sql = `
    SELECT * FROM user
    WHERE LOWER(User_Email) = LOWER(?) AND User_Password = ?
  `;

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    res.status(200).json({
      success: true,
      user: {
        ssn: user.User_SSN,
        name: user.User_Name,
        email: user.User_Email
      }
    });
  });
});

// ✅ User Registration
router.post('/register', (req, res) => {
  const { ssn, name, email, password } = req.body;
  if (!ssn || !name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const checkSql = 'SELECT * FROM user WHERE User_SSN = ? OR User_Email = ?';
  db.query(checkSql, [ssn, email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (results.length > 0) return res.status(409).json({ error: 'User already exists' });

    const insertSql = 'INSERT INTO user (User_SSN, User_Name, User_Email, User_Password) VALUES (?, ?, ?, ?)';
    db.query(insertSql, [ssn, name, email, password], (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to register user' });
      res.status(201).json({ success: true });
    });
  });
});

module.exports = router;