const bcrypt = require('bcryptjs');
const { getDb } = require('../models/db');

function getUsers(req, res) {
  const db = getDb();
  const users = db.prepare(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  ).all();
  res.json(users);
}

function getAgents(req, res) {
  const db = getDb();
  const agents = db.prepare(
    "SELECT id, name, email FROM users WHERE role = 'agent' ORDER BY name"
  ).all();
  res.json(agents);
}

async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'name, email, password required' });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const hashed = await bcrypt.hash(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
  ).run(name, email, hashed, role || 'agent');

  res.status(201).json({ id: result.lastInsertRowid, name, email, role: role || 'agent' });
}

function deleteUser(req, res) {
  const db = getDb();
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deleted' });
}

module.exports = { getUsers, getAgents, createUser, deleteUser };
