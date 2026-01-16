const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
// ⬆️ sesuaikan jika file DB kamu beda (misal ../db atau ../database)

/* =========================
   GET ALL USERS
   GET /api/users
========================= */
router.get('/', (req, res) => {
  db.query(
    'SELECT id, nama, email, role FROM users',
    (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Gagal mengambil data user',
          error: err,
        });
      }
      res.json(results);
    }
  );
});

/* =========================
   CREATE USER
   POST /api/users
========================= */
router.post('/', (req, res) => {
  const { nama, email, password, role } = req.body;

  // Validasi wajib
  if (!nama || !email || !password || !role) {
    return res.status(400).json({
      message: 'Nama, email, password, dan role wajib diisi',
    });
  }

  // Validasi role
  if (!['admin', 'client'].includes(role)) {
    return res.status(400).json({
      message: 'Role tidak valid (admin / client)',
    });
  }

  db.query(
    'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
    [nama, email, password, role],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Gagal menambahkan user',
          error: err,
        });
      }

      res.status(201).json({
        message: 'User berhasil ditambahkan',
        id: result.insertId,
      });
    }
  );
});

/* =========================
   UPDATE USER
   PUT /api/users/:id
========================= */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nama, email, role } = req.body;

  if (!nama || !email || !role) {
    return res.status(400).json({
      message: 'Nama, email, dan role wajib diisi',
    });
  }

  if (!['admin', 'client'].includes(role)) {
    return res.status(400).json({
      message: 'Role tidak valid',
    });
  }

  db.query(
    'UPDATE users SET nama = ?, email = ?, role = ? WHERE id = ?',
    [nama, email, role, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Gagal update user',
          error: err,
        });
      }

      res.json({
        message: 'User berhasil diupdate',
      });
    }
  );
});

/* =========================
   DELETE USER
   DELETE /api/users/:id
   (ADMIN TIDAK BISA DIHAPUS)
========================= */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM users WHERE id = ? AND role != "admin"',
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Gagal menghapus user',
          error: err,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({
          message: 'Admin tidak bisa dihapus',
        });
      }

      res.json({
        message: 'User berhasil dihapus',
      });
    }
  );
});

module.exports = router;
