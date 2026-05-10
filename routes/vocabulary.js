const express = require('express');
const router  = express.Router();
const db      = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.env.UPLOADS_PATH || '/mnt/usbdrive/uploads', 'images');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.userId}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Images only'));
  }
});

// GET all vocabulary for user
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT v.*, r.filename AS recording_filename
    FROM vocabulary v
    LEFT JOIN recordings r ON v.recording_id = r.id
    WHERE v.user_id = ?
    ORDER BY v.created_at DESC
  `).all(req.user.userId);
  res.json(rows);
});

// POST new vocabulary entry
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  const { word, label, recording_id, notes, language, timestamp } = req.body;
  if (!word) return res.status(400).json({ error: 'Word is required' });

  const image_path = req.file
    ? `/uploads/images/${req.file.filename}`
    : null;

  const result = db.prepare(`
    INSERT INTO vocabulary
      (user_id, recording_id, word, label, image_path, language, notes, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.userId,
    recording_id || null,
    word, label, image_path,
    language || 'en',
    notes, timestamp
  );

  res.status(201).json({ id: result.lastInsertRowid, word, image_path });
});

// DELETE vocabulary entry
router.delete('/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM vocabulary WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.userId);
  res.json({ success: true });
});

module.exports = router;
