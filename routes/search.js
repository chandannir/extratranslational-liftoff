const express = require('express');
const router  = express.Router();
const db      = require('../database/db');
const { requireAuth } = require('../middleware/auth');

// GET /api/search?q=apple&lang=en
router.get('/', requireAuth, (req, res) => {
  const { q, lang } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  const term = `%${q}%`;
  const rows = db.prepare(`
    SELECT v.*, r.file_path AS recording_path
    FROM vocabulary v
    LEFT JOIN recordings r ON v.recording_id = r.id
    WHERE v.user_id = ?
      AND (v.word LIKE ? OR v.label LIKE ? OR v.notes LIKE ?)
      AND (? IS NULL OR v.language = ?)
    ORDER BY v.created_at DESC
    LIMIT 50
  `).all(req.user.userId, term, term, term, lang || null, lang || null);

  res.json({ results: rows, count: rows.length });
});

module.exports = router;
