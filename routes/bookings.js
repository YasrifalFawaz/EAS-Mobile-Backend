const express = require('express');
const router = express.Router();
const db = require('../config/db');

const TARIF = 300000;

// CREATE BOOKING (CLIENT)
router.post('/bookings', (req, res) => {
  const { user_id, tanggal, jam_mulai, durasi } = req.body;

  const jamSelesaiQuery = `ADDTIME(?, SEC_TO_TIME(? * 3600))`;

  const cekBentrok = `
    SELECT * FROM bookings
    WHERE tanggal = ?
    AND status = 'approved'
    AND jam_mulai < ${jamSelesaiQuery}
    AND jam_selesai > ?
  `;

  db.query(
    cekBentrok,
    [tanggal, jam_mulai, durasi, jam_mulai],
    (err, result) => {
      if (err) {
        console.error('Error cek bentrok:', err);
        return res.json({ success: false, message: 'Database error' });
      }

      if (result.length > 0) {
        return res.json({ success: false, message: 'Jadwal bentrok' });
      }

      const total = durasi * TARIF;

      const insert = `
        INSERT INTO bookings
        (user_id, tanggal, jam_mulai, durasi, jam_selesai, total_biaya)
        VALUES (?, ?, ?, ?, ${jamSelesaiQuery}, ?)
      `;

      db.query(
        insert,
        [user_id, tanggal, jam_mulai, durasi, jam_mulai, durasi, total],
        (err) => {
          if (err) {
            console.error('Error insert booking:', err);
            return res.json({ success: false, message: 'Gagal membuat booking' });
          }
          res.json({ success: true, message: 'Booking berhasil' });
        }
      );
    }
  );
});

// GET BOOKING CLIENT (dengan nama user)
router.get('/bookings/user/:id', (req, res) => {
  const query = `
    SELECT b.*, u.nama AS nama_user
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `;
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error get user bookings:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json(results);
  });
});

// GET ALL BOOKINGS (ADMIN) — JOIN users
router.get('/bookings', (req, res) => {
  const query = `
    SELECT b.*, u.nama AS nama_user
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error get all bookings:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json(results);
  });
});

// APPROVE BOOKING
router.put('/bookings/:id/approve', (req, res) => {
  db.query(
    `UPDATE bookings SET status='approved' WHERE id=?`,
    [req.params.id],
    (err) => {
      if (err) {
        console.error('Error approve booking:', err);
        return res.json({ success: false, message: 'Gagal approve booking' });
      }
      res.json({ success: true, message: 'Booking disetujui' });
    }
  );
});

// REJECT BOOKING
router.put('/bookings/:id/reject', (req, res) => {
  db.query(
    `UPDATE bookings SET status='rejected' WHERE id=?`,
    [req.params.id],
    (err) => {
      if (err) {
        console.error('Error reject booking:', err);
        return res.json({ success: false, message: 'Gagal reject booking' });
      }
      res.json({ success: true, message: 'Booking ditolak' });
    }
  );
});

module.exports = router;