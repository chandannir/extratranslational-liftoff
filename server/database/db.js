const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/vocab.db');

// Make sure the directory exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// Enable WAL mode for better performance on Pi
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'user',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login    DATETIME
  );

  CREATE TABLE IF NOT EXISTS recordings (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename        TEXT    NOT NULL,
    file_path       TEXT    NOT NULL,
    mime_type       TEXT    NOT NULL DEFAULT 'video/webm',
    duration_ms     INTEGER,
    file_size_bytes INTEGER,
    recorded_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    status          TEXT    DEFAULT 'complete'
  );

  CREATE TABLE IF NOT EXISTS vocabulary (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recording_id INTEGER REFERENCES recordings(id) ON DELETE SET NULL,
    word         TEXT    NOT NULL,
    label        TEXT,
    image_path   TEXT,
    audio_path   TEXT,
    video_path   TEXT,
    language     TEXT    DEFAULT 'en',
    notes        TEXT,
    timestamp    DATETIME,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    target_type TEXT,
    target_id   INTEGER,
    ip_address  TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON vocabulary(word);
  CREATE INDEX IF NOT EXISTS idx_vocabulary_user ON vocabulary(user_id);
  CREATE INDEX IF NOT EXISTS idx_recordings_user ON recordings(user_id);
  CREATE INDEX IF NOT EXISTS idx_logs_user        ON logs(user_id);
`);

console.log('  Database ready at', dbPath);

module.exports = db;
