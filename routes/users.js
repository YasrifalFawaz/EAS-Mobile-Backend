const express = require('express');
const router = express.Router();
const db = require('../config/db'); // sesuaikan path DB kamu

// GET semua user
router.get('/', (req, res) => {
  db.query('SELECT id, nama, email, role FROM users', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// CREATE user
router.post('/', (req, res) => {
  const { nama, email, password } = req.body;

  if (!nama || !email || !password) {
    return res.status(400).json({ message: 'Data tidak lengkap' });
  }

  db.query(
    'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
    [nama, email, password, 'user'],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'User berhasil ditambahkan' });
    }
  );
});

// UPDATE user
router.put('/:id', (req, res) => {
  const { nama, email } = req.body;
  const { id } = req.params;

  db.query(
    'UPDATE users SET nama=?, email=? WHERE id=?',
    [nama, email, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'User berhasil diupdate' });
    }
  );
});

// DELETE user (admin tidak boleh dihapus)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM users WHERE id=? AND role!="admin"',
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'User berhasil dihapus' });
    }
  );
});

module.exports = router;
