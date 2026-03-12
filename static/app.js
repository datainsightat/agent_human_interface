/* ── Agent-Human Interface — Web UI ───────────────────────────────── */

const TYPE_CONFIG = {
  observation:     { color: '#6366f1', bg: 'rgba(99,102,241,.10)',  label: 'Observation',     icon: '👁',  arrow: '↑' },
  recommendation:  { color: '#f59e0b', bg: 'rgba(245,158,11,.10)', label: 'Recommendation',  icon: '💡', arrow: '↑' },
  alert:           { color: '#ef4444', bg: 'rgba(239,68,68,.10)',   label: 'Alert',           icon: '🚨', arrow: '↑' },
  acknowledgement: { color: '#22c55e', bg: 'rgba(34,197,94,.10)',  label: 'Acknowledgement', icon: '✅', arrow: '↕' },
  order:           { color: '#a855f7', bg: 'rgba(168,85,247,.10)', label: 'Order',           icon: '📋', arrow: '↓' },
  approval:        { color: '#06b6d4', bg: 'rgba(6,182,212,.10)',  label: 'Approval',        icon: '✓',  arrow: '↓' },
  override:        { color: '#f97316', bg: 'rgba(249,115,22,.10)', label: 'Override',        icon: '⚡', arrow: '↓' },
};

let entries = [];
let agentNames = [];
let es = null; // EventSource

// ── Auth ───────────────────────────────────────────────────────────

async function checkAuth() {
  const r = await fetch('/agents');
  if (r.status === 401) { showLogin(); return false; }
  const data = await r.json();
  agentNames = Object.keys(data);
  return true;
}

function showLogin() {
  document.getElementById('login-modal').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function showApp() {
  document.getElementById('login-modal').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}

async function login() {
  const pw = document.getElementById('pw').value;
  const r = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pw }),
  });
  if (r.ok) {
    document.getElementById('login-err').classList.add('hidden');
    showApp();
    await init();
  } else {
    document.getElementById('login-err').classList.remove('hidden');
  }
}

async function logout() {
  await fetch('/auth/logout', { method: 'POST' });
  if (es) { es.close(); es = null; }
  showLogin();
}

// ── Init ───────────────────────────────────────────────────────────

async function init() {
  populateDropdowns();
  await loadEntries();
  connectSSE();
}

function populateDropdowns() {
  const all = [...agentNames, 'all'];

  // compose "to" dropdown
  document.getElementById('c-to').innerHTML =
    all.map(a => `<option value="${a}">${a}</option>`).join('');

  // filter by agent (from or to)
  document.getElementById('filter-agent').innerHTML =
    '<option value="">All agents</option>' +
    agentNames.map(a => `<option value="${a}">${a}</option>`).join('');
}

// ── Log ────────────────────────────────────────────────────────────

async function loadEntries() {
  const r = await fetch('/exchange');
  entries = await r.json();
  renderEntries();
}

function renderEntries() {
  const ft = document.getElementById('filter-type').value;
  const fa = document.getElementById('filter-agent').value;

  let filtered = entries;
  if (ft) filtered = filtered.filter(e => e.type === ft);
  if (fa) filtered = filtered.filter(e => e.from === fa || e.to === fa || e.to === 'all');

  const sorted = [...filtered].reverse(); // newest first

  const container = document.getElementById('entries');
  if (!sorted.length) {
    container.innerHTML = '<div class="empty">No entries match the current filter.</div>';
    document.getElementById('entry-count').textContent = '';
    return;
  }

  container.innerHTML = sorted.map(entryHtml).join('');
  document.getElementById('entry-count').textContent = `${filtered.length} entries`;
}

function entryHtml(e) {
  const cfg = TYPE_CONFIG[e.type] || { color: '#6b7280', bg: 'rgba(107,114,128,.1)', label: e.type, icon: '·', arrow: '' };
  const ctx = e.context
    ? `<div class="e-ctx">${JSON.stringify(e.context, null, 2)}</div>`
    : '';
  const ts = e.created_at
    ? ` · ${new Date(e.created_at).toLocaleTimeString()}`
    : '';
  return `
<div class="entry" style="border-color:${cfg.color};background:${cfg.bg}">
  <div class="entry-head">
    <span class="type-badge" style="color:${cfg.color}">${cfg.icon} ${cfg.label} ${cfg.arrow}</span>
    <span class="e-id">${e.id}</span>
    <span class="e-status ${e.status}">${e.status}</span>
  </div>
  <div class="e-route">${e.from} → ${e.to}</div>
  <div class="e-content">${escHtml(e.content)}</div>
  ${ctx}
  <div class="e-date">${e.date}${ts}</div>
</div>`;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── SSE ────────────────────────────────────────────────────────────

function connectSSE() {
  if (es) es.close();
  es = new EventSource('/exchange/stream');

  es.onopen = () => setDot('ok', 'live');

  es.onmessage = ev => {
    const entry = JSON.parse(ev.data);
    if (entry.type === 'connected') return;
    entries.push(entry);
    renderEntries();
  };

  es.onerror = () => {
    setDot('err', 'reconnecting…');
    es.close();
    setTimeout(connectSSE, 4000);
  };
}

function setDot(cls, title) {
  const d = document.getElementById('dot');
  d.className = `dot ${cls}`;
  d.title = title;
}

// ── Compose ────────────────────────────────────────────────────────

function onTypeChange() {
  const t = document.getElementById('c-type').value;
  const labels = { order: 'Order', approval: 'Approval', override: 'Override' };
  document.getElementById('submit-btn').textContent = `Submit ${labels[t]}`;
}

function generateId() {
  const today = new Date().toISOString().slice(0, 10);
  const compact = today.replace(/-/g, '');
  const n = entries.filter(e => e.from === 'human' && e.date === today).length + 1;
  return `human-${compact}-${String(n).padStart(3, '0')}`;
}

async function submitEntry() {
  const type    = document.getElementById('c-type').value;
  const to      = document.getElementById('c-to').value;
  const content = document.getElementById('c-content').value.trim();
  const ctxRaw  = document.getElementById('c-ctx').value.trim();
  const id      = document.getElementById('c-id').value.trim() || generateId();

  if (!content) { setMsg('Content is required.', 'err'); return; }

  let context = null;
  if (ctxRaw) {
    try { context = JSON.parse(ctxRaw); }
    catch { setMsg('Context must be valid JSON.', 'err'); return; }
  }

  const body = {
    id,
    type,
    to,
    date: new Date().toISOString().slice(0, 10),
    status: 'pending',
    content,
    ...(context && { context }),
  };

  const r = await fetch('/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (r.ok) {
    setMsg('Entry submitted.', 'ok');
    document.getElementById('c-content').value = '';
    document.getElementById('c-ctx').value = '';
    document.getElementById('c-id').value = '';
  } else {
    const err = await r.json().catch(() => ({}));
    setMsg(err.detail || 'Error submitting entry.', 'err');
  }
}

function setMsg(text, cls) {
  const el = document.getElementById('submit-msg');
  el.textContent = text;
  el.className = `msg ${cls}`;
  setTimeout(() => { el.textContent = ''; el.className = 'msg'; }, 3500);
}

// ── Export ─────────────────────────────────────────────────────────

function exportLog() {
  window.open('/exchange/export', '_blank');
}

// ── Keyboard shortcuts ─────────────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'pw') login();
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target.id === 'c-content') submitEntry();
});

// ── Bootstrap ──────────────────────────────────────────────────────

(async () => {
  const ok = await checkAuth();
  if (ok) { showApp(); await init(); }
})();
