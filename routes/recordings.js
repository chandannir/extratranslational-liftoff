const express = require('express');
const router  = express.Router();
const db      = require('../database/db');
const { requireAuth } = require('../middleware/auth');

// GET all recordings for logged in user
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM recordings
    WHERE user_id = ?
    ORDER BY recorded_at DESC
  `).all(req.user.userId);
  res.json(rows);
});

// GET single recording
router.get('/:id', requireAuth, (req, res) => {
  const row = db.prepare(`
    SELECT * FROM recordings
    WHERE id = ? AND user_id = ?
  `).get(req.params.id, req.user.userId);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// DELETE a recording
router.delete('/:id', requireAuth, (req, res) => {
  const row = db.prepare(`
    SELECT * FROM recordings WHERE id = ? AND user_id = ?
  `).get(req.params.id, req.user.userId);
  if (!row) return res.status(404).json({ error: 'Not found' });

  // Delete file from disk
  const fs = require('fs');
  if (fs.existsSync(row.file_path)) fs.unlinkSync(row.file_path);

  db.prepare('DELETE FROM recordings WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
