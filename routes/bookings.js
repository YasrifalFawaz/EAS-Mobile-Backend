const express = require('express');
const router = express.Router();
const db = require('../config/db');

const TARIF = 300000;

// CREATE BOOKING (CLIENT)
router.post('/bookings', (req, res) => {
  const { user_id, tanggal, jam_mulai, durasi } = req.body;

  const jamSelesaiQuery = `ADDTIME(?, SEC_TO_TIME(? * 3600))`;

  // Cek bentrok
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
          if (err) return res.json({ success: false });
          res.json({ success: true, message: 'Booking berhasil' });
        }
      );
    }
  );
});

// GET BOOKING CLIENT
router.get('/bookings/user/:id', (req, res) => {
  db.query(
    'SELECT * FROM bookings WHERE user_id=?',
    [req.params.id],
    (err, results) => {
      res.json(results);
    }
  );
});

// GET ALL BOOKINGS (ADMIN)
router.get('/bookings', (req, res) => {
  db.query('SELECT * FROM bookings', (err, results) => {
    res.json(results);
  });
});

// APPROVE BOOKING
router.put('/bookings/:id/approve', (req, res) => {
  db.query(
    `UPDATE bookings SET status='approved' WHERE id=?`,
    [req.params.id],
    () => res.json({ success: true })
  );
});

// REJECT BOOKING
router.put('/bookings/:id/reject', (req, res) => {
  db.query(
    `UPDATE bookings SET status='rejected' WHERE id=?`,
    [req.params.id],
    () => res.json({ success: true })
  );
});

module.exports = router;
