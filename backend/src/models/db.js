const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../smartseason.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);

    // Performance + safety
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    initSchema();
    seedUsers(); // 👈 ensure users exist
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

//
// 🌱 SEED USERS (CRITICAL FOR LOGIN)
//
function seedUsers() {
  const existing = db.prepare("SELECT COUNT(*) as count FROM users").get();

  if (existing.count === 0) {
    const insert = db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `);

    insert.run("Admin User", "admin@test.com", "123456", "admin");
    insert.run("Field Agent", "agent@test.com", "123456", "agent");

    console.log("🌱 Seeded default users");
  }
}

module.exports = { getDb };