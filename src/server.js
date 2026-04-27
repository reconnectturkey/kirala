const express = require('express');
const path = require('path');
const dayjs = require('dayjs');

const {
  insertLead,
  listLeads,
  todayFollowups,
  overdueFollowups,
  dashboardCounts,
  sourceDistribution,
  updateLeadStatus,
  insertLeadNote
} = require('./db');

const {
  LEAD_SOURCES,
  LEAD_TYPES,
  LEAD_STATUSES,
  USERS
} = require('./constants');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.statuses = LEAD_STATUSES;
  next();
});

app.get('/', (req, res) => {
  const counts = dashboardCounts.get() || { total: 0, active: 0, closed: 0 };
  const sources = sourceDistribution.all();

  res.render('dashboard', {
    title: 'Dashboard',
    counts,
    sources
  });
});

app.get('/leads', (req, res) => {
  const leads = listLeads.all();
  res.render('leads-list', { title: 'Lead Listesi', leads });
});

app.get('/leads/new', (req, res) => {
  res.render('lead-form', {
    title: 'Yeni Lead Ekle',
    sources: LEAD_SOURCES,
    types: LEAD_TYPES,
    statuses: LEAD_STATUSES,
    users: USERS,
    today: dayjs().format('YYYY-MM-DD')
  });
});

app.post('/leads', (req, res) => {
  const payload = {
    full_name: req.body.full_name,
    phone: req.body.phone,
    source: req.body.source,
    lead_type: req.body.lead_type,
    district: req.body.district || null,
    short_note: req.body.short_note || null,
    owner: req.body.owner,
    status: req.body.status,
    last_contact_date: req.body.last_contact_date || null,
    next_action_date: req.body.next_action_date || null,
    revenue_note: req.body.revenue_note || null
  };

  insertLead.run(payload);
  res.redirect('/leads');
});

app.post('/leads/:id/status', (req, res) => {
  updateLeadStatus.run({
    id: Number(req.params.id),
    status: req.body.status,
    next_action_date: req.body.next_action_date || null,
    last_contact_date: dayjs().format('YYYY-MM-DD')
  });

  res.redirect(req.get('referer') || '/leads');
});

app.post('/leads/:id/notes', (req, res) => {
  const note = (req.body.note || '').trim();

  if (note) {
    insertLeadNote.run({
      lead_id: Number(req.params.id),
      note
    });
  }

  res.redirect(req.get('referer') || '/leads');
});

app.get('/followups/today', (req, res) => {
  const today = dayjs().format('YYYY-MM-DD');
  const leads = todayFollowups.all({ today });
  res.render('followup-list', {
    title: 'Bugünkü Takipler',
    subtitle: `Tarih: ${today}`,
    leads,
    emptyMessage: 'Bugün için planlanmış takip bulunmuyor.'
  });
});

app.get('/followups/overdue', (req, res) => {
  const today = dayjs().format('YYYY-MM-DD');
  const leads = overdueFollowups.all({ today });
  res.render('followup-list', {
    title: 'Geciken Takipler',
    subtitle: `Referans tarih: ${today}`,
    leads,
    emptyMessage: 'Geciken takip bulunmuyor.'
  });
});

app.listen(PORT, () => {
  console.log(`Lead takip sistemi çalışıyor: http://localhost:${PORT}`);
});
