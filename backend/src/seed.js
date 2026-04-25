const bcrypt = require('bcryptjs');
const { getDb } = require('./models/db');

async function seed() {
  const db = getDb();

  console.log('🌱 Seeding database...');

  // Clear existing data (safe order for foreign keys)
  db.exec(`
    DELETE FROM field_updates;
    DELETE FROM fields;
    DELETE FROM users;
  `);

  // Create users (hashed passwords kept as you requested flow stability)
  const adminPass = await bcrypt.hash('admin123', 10);
  const agentPass = await bcrypt.hash('agent123', 10);

  const adminId = db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')"
  ).run('Jessica Mwangi', 'admin@smartseason.com', adminPass).lastInsertRowid;

  const agent1Id = db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'agent')"
  ).run('James Otieno', 'james@smartseason.com', agentPass).lastInsertRowid;

  const agent2Id = db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'agent')"
  ).run('Amina Hassan', 'amina@smartseason.com', agentPass).lastInsertRowid;

  // Fields
  const fields = [
    { name: 'North Block A',  crop: 'Maize',   date: daysAgo(80),  stage: 'Ready',     agent: agent1Id },
    { name: 'South Valley',   crop: 'Wheat',   date: daysAgo(30),  stage: 'Growing',   agent: agent1Id },
    { name: 'East Ridge',     crop: 'Beans',   date: daysAgo(5),   stage: 'Planted',   agent: agent1Id },
    { name: 'West Plot 1',    crop: 'Sorghum', date: daysAgo(95),  stage: 'Harvested', agent: agent2Id },
    { name: 'Hillside Field', crop: 'Rice',    date: daysAgo(130), stage: 'Growing',   agent: agent2Id },
    { name: 'River Bend',     crop: 'Maize',   date: daysAgo(20),  stage: 'Growing',   agent: agent2Id },
    { name: 'Central Plot',   crop: 'Wheat',   date: daysAgo(10),  stage: 'Planted',   agent: null     },
  ];

  for (const f of fields) {
    const fieldId = db.prepare(`
      INSERT INTO fields (
        name,
        crop_type,
        planting_date,
        stage,
        assigned_agent_id,
        area_hectares
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      f.name,
      f.crop,
      f.date,
      f.stage,
      f.agent,
      Number((Math.random() * 5 + 0.5).toFixed(1))
    ).lastInsertRowid;

    // Updates history (safe + consistent)
    if (f.stage !== 'Planted') {
      db.prepare(`
        INSERT INTO field_updates (
          field_id,
          agent_id,
          old_stage,
          new_stage,
          note,
          created_at
        )
        VALUES (?, ?, 'Planted', 'Growing', ?, datetime('now', '-20 days'))
      `).run(
        fieldId,
        f.agent || adminId,
        'Seedlings emerging well, good moisture levels.'
      );
    }

    if (f.stage === 'Ready' || f.stage === 'Harvested') {
      db.prepare(`
        INSERT INTO field_updates (
          field_id,
          agent_id,
          old_stage,
          new_stage,
          note,
          created_at
        )
        VALUES (?, ?, 'Growing', ?, ?, datetime('now', '-5 days'))
      `).run(
        fieldId,
        f.agent || adminId,
        f.stage,
        'Crop looks healthy and mature.'
      );
    }
  }

  console.log('✅ Seed complete!\n');
  console.log('Demo credentials:');
  console.log('  Admin:   admin@smartseason.com / admin123');
  console.log('  Agent 1: james@smartseason.com / agent123');
  console.log('  Agent 2: amina@smartseason.com / agent125');
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

seed().catch(console.error);