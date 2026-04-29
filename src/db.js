const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'data.sqlite');
const db = new Database(dbPath);

const tableColumns = db
  .prepare("PRAGMA table_info(leads)")
  .all()
  .map((row) => row.name);

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

if (!tableColumns.includes('is_archived')) {
  db.exec('ALTER TABLE leads ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0');
}

const insertLead = db.prepare(`
  INSERT INTO leads (
    full_name, phone, source, lead_type, district, short_note,
    owner, status, last_contact_date, next_action_date, revenue_note, is_archived
  ) VALUES (
    @full_name, @phone, @source, @lead_type, @district, @short_note,
    @owner, @status, @last_contact_date, @next_action_date, @revenue_note, 0
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
  WHERE (@owner = '' OR l.owner = @owner)
    AND (@status = '' OR l.status = @status)
    AND (
      @query = ''
      OR l.full_name LIKE '%' || @query || '%'
      OR l.phone LIKE '%' || @query || '%'
      OR l.district LIKE '%' || @query || '%'
    )
    AND (@show_archived = 1 OR l.is_archived = 0)
  ORDER BY datetime(l.created_at) DESC, l.id DESC
`);

const getLeadById = db.prepare(`
  SELECT *
  FROM leads
  WHERE id = @id
  LIMIT 1
`);

const updateLead = db.prepare(`
  UPDATE leads
  SET full_name = @full_name,
      phone = @phone,
      source = @source,
      lead_type = @lead_type,
      district = @district,
      short_note = @short_note,
      owner = @owner,
      status = @status,
      last_contact_date = @last_contact_date,
      next_action_date = @next_action_date,
      revenue_note = @revenue_note
  WHERE id = @id
`);

const todayFollowups = db.prepare(`
  SELECT *
  FROM leads
  WHERE next_action_date = @today
    AND status NOT IN ('Kapandı', 'Uygun değil')
    AND is_archived = 0
  ORDER BY id DESC
`);

const overdueFollowups = db.prepare(`
  SELECT *
  FROM leads
  WHERE next_action_date IS NOT NULL
    AND date(next_action_date) < date(@today)
    AND status NOT IN ('Kapandı', 'Uygun değil')
    AND is_archived = 0
  ORDER BY date(next_action_date) ASC, id DESC
`);

const dashboardCounts = db.prepare(`
  SELECT
    COUNT(*) AS total,
    SUM(CASE WHEN status NOT IN ('Kapandı', 'Uygun değil') AND is_archived = 0 THEN 1 ELSE 0 END) AS active,
    SUM(CASE WHEN status = 'Kapandı' THEN 1 ELSE 0 END) AS closed
  FROM leads
  WHERE is_archived = 0
`);

const sourceDistribution = db.prepare(`
  SELECT source, COUNT(*) as count
  FROM leads
  WHERE is_archived = 0
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

const archiveLead = db.prepare(`
  UPDATE leads
  SET is_archived = @is_archived
  WHERE id = @id
`);

module.exports = {
  db,
  insertLead,
  listLeads,
  getLeadById,
  updateLead,
  todayFollowups,
  overdueFollowups,
  dashboardCounts,
  sourceDistribution,
  updateLeadStatus,
  insertLeadNote,
  archiveLead
};
