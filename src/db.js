const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'data.sqlite');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    source TEXT NOT NULL,
    lead_type TEXT NOT NULL,
    district TEXT,
    short_note TEXT,
    owner TEXT NOT NULL,
    status TEXT NOT NULL,
    last_contact_date TEXT,
    next_action_date TEXT,
    revenue_note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lead_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
  );
`);

const insertLead = db.prepare(`
  INSERT INTO leads (
    full_name, phone, source, lead_type, district, short_note,
    owner, status, last_contact_date, next_action_date, revenue_note
  ) VALUES (
    @full_name, @phone, @source, @lead_type, @district, @short_note,
    @owner, @status, @last_contact_date, @next_action_date, @revenue_note
  )
`);

const listLeads = db.prepare(`
  SELECT
    l.*,
    (
      SELECT ln.note
      FROM lead_notes ln
      WHERE ln.lead_id = l.id
      ORDER BY datetime(ln.created_at) DESC, ln.id DESC
      LIMIT 1
    ) AS latest_note,
    (
      SELECT COUNT(*)
      FROM lead_notes ln
      WHERE ln.lead_id = l.id
    ) AS note_count
  FROM leads l
  ORDER BY datetime(l.created_at) DESC, l.id DESC
`);

const todayFollowups = db.prepare(`
  SELECT *
  FROM leads
  WHERE next_action_date = @today
    AND status NOT IN ('Kapandı', 'Uygun değil')
  ORDER BY id DESC
`);

const overdueFollowups = db.prepare(`
  SELECT *
  FROM leads
  WHERE next_action_date IS NOT NULL
    AND date(next_action_date) < date(@today)
    AND status NOT IN ('Kapandı', 'Uygun değil')
  ORDER BY date(next_action_date) ASC, id DESC
`);

const dashboardCounts = db.prepare(`
  SELECT
    COUNT(*) AS total,
    SUM(CASE WHEN status NOT IN ('Kapandı', 'Uygun değil') THEN 1 ELSE 0 END) AS active,
    SUM(CASE WHEN status = 'Kapandı' THEN 1 ELSE 0 END) AS closed
  FROM leads
`);

const sourceDistribution = db.prepare(`
  SELECT source, COUNT(*) as count
  FROM leads
  GROUP BY source
  ORDER BY count DESC
`);

const updateLeadStatus = db.prepare(`
  UPDATE leads
  SET status = @status,
      next_action_date = @next_action_date,
      last_contact_date = @last_contact_date
  WHERE id = @id
`);

const insertLeadNote = db.prepare(`
  INSERT INTO lead_notes (lead_id, note)
  VALUES (@lead_id, @note)
`);

module.exports = {
  db,
  insertLead,
  listLeads,
  todayFollowups,
  overdueFollowups,
  dashboardCounts,
  sourceDistribution,
  updateLeadStatus,
  insertLeadNote
};
