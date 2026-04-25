const { getDb } = require('../models/db');
const { enrichField } = require('../models/fieldStatus');

// GET /fields — admin gets all, agent gets assigned
function getFields(req, res) {
  const db = getDb();
  let rows;

  if (req.user.role === 'admin') {
    rows = db.prepare(`
      SELECT f.*, u.name AS agent_name, u.email AS agent_email
      FROM fields f
      LEFT JOIN users u ON f.assigned_agent_id = u.id
      ORDER BY f.updated_at DESC
    `).all();
  } else {
    rows = db.prepare(`
      SELECT f.*, u.name AS agent_name, u.email AS agent_email
      FROM fields f
      LEFT JOIN users u ON f.assigned_agent_id = u.id
      WHERE f.assigned_agent_id = ?
      ORDER BY f.updated_at DESC
    `).all(req.user.id);
  }

  res.json(rows.map(enrichField));
}

// GET /fields/:id
function getField(req, res) {
  const db = getDb();
  const field = db.prepare(`
    SELECT f.*, u.name AS agent_name, u.email AS agent_email
    FROM fields f
    LEFT JOIN users u ON f.assigned_agent_id = u.id
    WHERE f.id = ?
  `).get(req.params.id);

  if (!field) return res.status(404).json({ error: 'Field not found' });

  // Agents can only see their own fields
  if (req.user.role === 'agent' && field.assigned_agent_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const updates = db.prepare(`
    SELECT fu.*, u.name AS agent_name
    FROM field_updates fu
    JOIN users u ON fu.agent_id = u.id
    WHERE fu.field_id = ?
    ORDER BY fu.created_at DESC
    LIMIT 20
  `).all(field.id);

  res.json({ ...enrichField(field), updates });
}

// POST /fields — admin only
function createField(req, res) {
  const { name, crop_type, planting_date, stage, assigned_agent_id, location, area_hectares } = req.body;
  if (!name || !crop_type || !planting_date)
    return res.status(400).json({ error: 'name, crop_type, and planting_date are required' });

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO fields (name, crop_type, planting_date, stage, assigned_agent_id, location, area_hectares)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, crop_type, planting_date,
    stage || 'Planted',
    assigned_agent_id || null,
    location || null,
    area_hectares || null
  );

  const field = db.prepare('SELECT * FROM fields WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(enrichField(field));
}

// PATCH /fields/:id — admin can edit all; agent can only update stage + note
function updateField(req, res) {
  const db = getDb();
  const field = db.prepare('SELECT * FROM fields WHERE id = ?').get(req.params.id);
  if (!field) return res.status(404).json({ error: 'Field not found' });

  if (req.user.role === 'agent' && field.assigned_agent_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (req.user.role === 'agent') {
    // Agents may only update stage and add a note
    const { stage, note } = req.body;
    const newStage = stage || field.stage;

    db.prepare(`
      UPDATE fields SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(newStage, field.id);

    db.prepare(`
      INSERT INTO field_updates (field_id, agent_id, old_stage, new_stage, note)
      VALUES (?, ?, ?, ?, ?)
    `).run(field.id, req.user.id, field.stage, newStage, note || null);

  } else {
    // Admin can update anything
    const {
      name, crop_type, planting_date, stage,
      assigned_agent_id, location, area_hectares, note
    } = req.body;

    db.prepare(`
      UPDATE fields SET
        name = COALESCE(?, name),
        crop_type = COALESCE(?, crop_type),
        planting_date = COALESCE(?, planting_date),
        stage = COALESCE(?, stage),
        assigned_agent_id = ?,
        location = COALESCE(?, location),
        area_hectares = COALESCE(?, area_hectares),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name, crop_type, planting_date, stage,
      assigned_agent_id !== undefined ? assigned_agent_id : field.assigned_agent_id,
      location, area_hectares, field.id
    );

    if (stage && stage !== field.stage) {
      db.prepare(`
        INSERT INTO field_updates (field_id, agent_id, old_stage, new_stage, note)
        VALUES (?, ?, ?, ?, ?)
      `).run(field.id, req.user.id, field.stage, stage, note || null);
    }
  }

  const updated = db.prepare(`
    SELECT f.*, u.name AS agent_name FROM fields f
    LEFT JOIN users u ON f.assigned_agent_id = u.id
    WHERE f.id = ?
  `).get(field.id);

  res.json(enrichField(updated));
}

// DELETE /fields/:id — admin only
function deleteField(req, res) {
  const db = getDb();
  const field = db.prepare('SELECT id FROM fields WHERE id = ?').get(req.params.id);
  if (!field) return res.status(404).json({ error: 'Field not found' });
  db.prepare('DELETE FROM fields WHERE id = ?').run(req.params.id);
  res.json({ message: 'Field deleted' });
}

// GET /fields/:id/updates
function getFieldUpdates(req, res) {
  const db = getDb();
  const updates = db.prepare(`
    SELECT fu.*, u.name AS agent_name
    FROM field_updates fu
    JOIN users u ON fu.agent_id = u.id
    WHERE fu.field_id = ?
    ORDER BY fu.created_at DESC
  `).all(req.params.id);
  res.json(updates);
}

module.exports = { getFields, getField, createField, updateField, deleteField, getFieldUpdates };
