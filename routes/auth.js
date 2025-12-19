const express = require('express');
const router = express.Router();
const db = require('../config/db');

// REGISTER
router.post('/register', (req, res) => {
  const { nama, email, password } = req.body;
  db.query(
    "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, 'client')",
    [nama, email, password],
    () => res.json({ success: true })
  );
});

// LOGIN
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query(
    'SELECT * FROM users WHERE email=? AND password=?',
    [email, password],
    (err, result) => {
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.json({ message: 'Login gagal' });
      }
    }
  );
});

// ✅ ENDPOINT CEK USERS (INI YANG SERING LUPA)
router.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    res.json(results);
  });
});

module.exports = router;
