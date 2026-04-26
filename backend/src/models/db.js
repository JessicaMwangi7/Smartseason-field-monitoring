const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Use Railway volume in production, local file in dev
const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/data/smartseason.db'
  : path.join(__dirname, '../../smartseason.db');

// Ensure directory exists (for /data on Railway)
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    console.log(`Opening database at: ${DB_PATH}`);
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'agent')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      crop_type TEXT NOT NULL,
      planting_date TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'Planted' 
        CHECK(stage IN ('Planted','Growing','Ready','Harvested')),
      assigned_agent_id INTEGER,
      location TEXT,
      area_hectares REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_agent_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS field_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field_id INTEGER NOT NULL,
      agent_id INTEGER NOT NULL,
      old_stage TEXT,
      new_stage TEXT,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE,
      FOREIGN KEY (agent_id) REFERENCES users(id)
    );
  `);
}

module.exports = { getDb };