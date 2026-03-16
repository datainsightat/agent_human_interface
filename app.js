/* ── Agent-Human Interface — Live Simulation ─────────────────────── */

// ── Entry type config ─────────────────────────────────────────────
const TYPE_CONFIG = {
  observation:     { color: '#6366f1', bg: 'rgba(99,102,241,.12)',   label: 'Observation',     dir: 'up',   icon: '👁', arrow: '↑' },
  recommendation:  { color: '#f59e0b', bg: 'rgba(245,158,11,.12)',  label: 'Recommendation',  dir: 'up',   icon: '💡', arrow: '↑' },
  alert:           { color: '#ef4444', bg: 'rgba(239,68,68,.12)',    label: 'Alert',           dir: 'up',   icon: '🚨', arrow: '↑' },
  acknowledgement: { color: '#22c55e', bg: 'rgba(34,197,94,.12)',   label: 'Acknowledgement', dir: 'any',  icon: '✅', arrow: '↕' },
  order:           { color: '#a855f7', bg: 'rgba(168,85,247,.12)',  label: 'Order',           dir: 'down', icon: '📋', arrow: '↓' },
  approval:        { color: '#06b6d4', bg: 'rgba(6,182,212,.12)',   label: 'Approval',        dir: 'down', icon: '✓',  arrow: '↓' },
  override:        { color: '#f97316', bg: 'rgba(249,115,22,.12)',  label: 'Override',        dir: 'down', icon: '⚡', arrow: '↓' },
};

const AGENT_TYPES = ['observation', 'recommendation', 'alert', 'acknowledgement'];
const HUMAN_TYPES = ['order', 'approval', 'override'];

// ── Initial log state ─────────────────────────────────────────────
const INITIAL_ENTRIES = [
  {
    id: 'init-001',
    type: 'observation',
    from: 'harlie',
    to: 'all',
    date: '2026-03-11',
    status: 'noted',
    content: 'Exchange layer initialized. Agents write observations and recommendations upward. Humans write orders and approvals downward. All entries are append-only — no one rewrites another party\'s entries.',
    context: { schema_version: '1.0' }
  }
];

// ── Scenario definition ───────────────────────────────────────────
const SCENARIO_STEPS = [
  {
    title: 'Scout discovers a gap',
    description: 'Scout researched the latest DuckDB release. Version 1.5 introduced the VARIANT type — a major new capability with no case study on datainsight.at. Scout writes a recommendation to Project Architect, including the suggested slug and priority.',
    entry: {
      id: 'scout-20260311-001',
      type: 'recommendation',
      from: 'scout',
      to: 'project_architect',
      date: '2026-03-11',
      status: 'pending',
      content: 'DuckDB 1.5 VARIANT type is a major new capability with no case study. Recommend: "DuckDB Lakehouse" case covering VARIANT, DuckLake catalog, and geospatial types.',
      context: { trigger_tool: 'duckdb', trigger_version: '1.5.0', suggested_slug: 'duckdb-lakehouse', priority: 'high' }
    }
  },
  {
    title: 'Market Watcher independently confirms',
    description: 'Market Watcher added DuckDB 1.5 to market.json as a highlighted tool. It checks for a related case study — none exists. It writes a second recommendation, independently reaching the same conclusion as Scout.',
    entry: {
      id: 'market-20260311-001',
      type: 'recommendation',
      from: 'market_watcher',
      to: 'project_architect',
      date: '2026-03-11',
      status: 'pending',
      content: 'Added DuckDB 1.5 to market.json (highlighted, Analytics Database). No case study exists for this tool category. Recommend a DuckDB-focused end-to-end case study.',
      context: { trigger_tool: 'duckdb', suggested_slug: 'duckdb-lakehouse', priority: 'high' }
    }
  },
  {
    title: 'Human writes an order',
    description: 'You read the exchange log and see two independent recommendations pointing to the same gap. You write an order — no code needed, just append a structured entry to exchange.json — making this the top priority this cycle.',
    entry: {
      id: 'human-20260311-001',
      type: 'order',
      from: 'human',
      to: 'project_architect',
      date: '2026-03-11',
      status: 'pending',
      content: 'Prioritise the DuckDB Lakehouse case study over any other pending recommendations this cycle. Include VARIANT type, DuckLake catalog integration, and a complete end-to-end pipeline example.',
      context: { priority: 'high', deadline: 'this_cycle' }
    }
  },
  {
    title: 'Project Architect acts on the exchange',
    description: 'Project Architect reads all pending entries addressed to it. It finds 2 recommendations + 1 order, all converging on the same case study. It creates the page, adds the project card, then writes an acknowledgement recording the action.',
    entry: {
      id: 'architect-20260311-001',
      type: 'acknowledgement',
      from: 'project_architect',
      to: 'all',
      date: '2026-03-11',
      status: 'acted',
      content: 'Created projects/duckdb-lakehouse/index.html as Case #014. Added project card to index.html. Acted on all 3 pending entries addressed to project_architect.',
      context: { refs: ['scout-20260311-001', 'market-20260311-001', 'human-20260311-001'], slug: 'duckdb-lakehouse', case_number: 14 }
    }
  },
  {
    title: 'Publisher closes the cycle',
    description: 'Publisher reviews all changes, verifies the case study renders correctly, and commits. The updated exchange.json is included — making every agent decision a permanently queryable data artifact.',
    entry: {
      id: 'publisher-20260311-001',
      type: 'observation',
      from: 'publisher',
      to: 'all',
      date: '2026-03-11',
      status: 'noted',
      content: 'Committed and pushed: Case #014 (duckdb-lakehouse), updated exchange.json, updated market.json. Commit: feat(collective): DuckDB Lakehouse case study and market updates.',
      context: { commit_type: 'feat(collective)', files_changed: 4, git_pushed: true }
    }
  }
];

// ── App state ─────────────────────────────────────────────────────
let entries = [...INITIAL_ENTRIES];
let activeFilter = 'all';
let scenarioStep = -1;
let scenarioActive = false;
const idCounters = {};

// ── ID generation ─────────────────────────────────────────────────
function genId(from) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const key = `${from}-${today}`;
  idCounters[key] = (idCounters[key] || 0) + 1;
  return `${from}-${today}-${String(idCounters[key]).padStart(3, '0')}`;
}

// ── Render a single entry card ────────────────────────────────────
function renderEntry(entry) {
  const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.observation;
  const hasCtx = entry.context && Object.keys(entry.context).length > 0;
  const ctxStr = hasCtx ? JSON.stringify(entry.context, null, 2) : '';

  return `
    <div class="entry-card" data-id="${entry.id}" data-type="${entry.type}">
      <div class="entry-header" onclick="toggleExpand('${entry.id}')">
        <div class="entry-top">
          <span class="entry-type-badge"
            style="background:${cfg.bg};color:${cfg.color};border-color:${cfg.color}40">
            ${cfg.icon} ${cfg.label}
          </span>
          <span class="entry-dir">${cfg.arrow}</span>
          <span class="entry-status status-${entry.status}">${entry.status}</span>
        </div>
        <div class="entry-route">
          <span class="from">${entry.from}</span>
          <span class="arrow">→</span>
          <span class="to">${entry.to}</span>
        </div>
        <div class="entry-meta">
          <code class="entry-id">${entry.id}</code>
          <span class="entry-date">${entry.date}</span>
        </div>
        <p class="entry-content">${escHtml(entry.content)}</p>
        ${hasCtx ? `<button class="expand-btn" id="expand-btn-${entry.id}">▶ show context</button>` : ''}
      </div>
      ${hasCtx ? `
        <div class="entry-context" id="ctx-${entry.id}" style="display:none">
          <pre class="context-code">${escHtml(ctxStr)}</pre>
        </div>
      ` : ''}
    </div>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toggleExpand(id) {
  const ctx = document.getElementById(`ctx-${id}`);
  const btn = document.getElementById(`expand-btn-${id}`);
  if (!ctx) return;
  const open = ctx.style.display !== 'none';
  ctx.style.display = open ? 'none' : 'block';
  if (btn) btn.textContent = open ? '▶ show context' : '▼ hide context';
}

// ── Render exchange log ───────────────────────────────────────────
function renderLog() {
  const log = document.getElementById('exchange-log');
  const countEl = document.getElementById('log-count');

  let filtered = activeFilter === 'all'
    ? entries
    : entries.filter(e => e.type === activeFilter);

  // Show newest first
  const displayed = [...filtered].reverse();

  if (displayed.length === 0) {
    log.innerHTML = `
      <div class="empty-log">
        <div class="empty-icon">📭</div>
        <p>No entries match this filter.</p>
      </div>`;
  } else {
    log.innerHTML = displayed.map(renderEntry).join('');
  }

  if (countEl) countEl.textContent = `${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}${activeFilter !== 'all' ? ` · ${activeFilter}` : ''}`;
}

// ── Add an entry and animate ──────────────────────────────────────
function addEntry(entry) {
  entries.push(entry);
  renderLog();
  // Scroll log to top to reveal newest entry
  const log = document.getElementById('exchange-log');
  if (log) log.scrollTop = 0;
  // Briefly highlight the new card
  setTimeout(() => {
    const card = document.querySelector(`.entry-card[data-id="${entry.id}"]`);
    if (card) {
      card.classList.add('new');
      setTimeout(() => card.classList.remove('new'), 2500);
    }
  }, 40);
}

// ── Agent composer ────────────────────────────────────────────────
function initAgentComposer() {
  const form = document.getElementById('agent-form');
  if (!form) return;

  // Type radio UI
  form.querySelectorAll('.type-option').forEach(opt => {
    opt.addEventListener('click', () => {
      form.querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input[type="radio"]').checked = true;
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const role    = document.getElementById('agent-role').value;
    const typeEl  = form.querySelector('input[name="agent-type"]:checked');
    const to      = document.getElementById('agent-to').value;
    const content = document.getElementById('agent-content').value.trim();
    const ctxRaw  = document.getElementById('agent-context').value.trim();

    if (!content) { flash('agent-content', 'Please write content.'); return; }

    const type = typeEl ? typeEl.value : 'observation';
    const statusMap = { observation: 'noted', recommendation: 'pending', alert: 'pending', acknowledgement: 'acted' };

    let ctx = {};
    if (ctxRaw) {
      try { ctx = JSON.parse(ctxRaw); } catch { ctx = { note: ctxRaw }; }
    }

    addEntry({
      id:      genId(role),
      type,
      from:    role,
      to,
      date:    todayStr(),
      status:  statusMap[type] || 'pending',
      content,
      context: ctx
    });

    document.getElementById('agent-content').value = '';
    document.getElementById('agent-context').value = '';
  });
}

// ── Human composer ────────────────────────────────────────────────
function initHumanComposer() {
  const form = document.getElementById('human-form');
  if (!form) return;

  form.querySelectorAll('.type-option').forEach(opt => {
    opt.addEventListener('click', () => {
      form.querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input[type="radio"]').checked = true;
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const typeEl   = form.querySelector('input[name="human-type"]:checked');
    const to       = document.getElementById('human-to').value;
    const content  = document.getElementById('human-content').value.trim();
    const priority = document.getElementById('human-priority').value;

    if (!content) { flash('human-content', 'Please write content.'); return; }

    const type = typeEl ? typeEl.value : 'order';

    addEntry({
      id:      genId('human'),
      type,
      from:    'human',
      to,
      date:    todayStr(),
      status:  'pending',
      content,
      context: { priority }
    });

    document.getElementById('human-content').value = '';
  });
}

// ── Filter ────────────────────────────────────────────────────────
function initFilter() {
  const sel = document.getElementById('log-filter');
  if (!sel) return;
  sel.addEventListener('change', () => {
    activeFilter = sel.value;
    renderLog();
  });
}

// ── Clear log ─────────────────────────────────────────────────────
function initClear() {
  const btn = document.getElementById('btn-clear');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (confirm('Reset log to initial state?')) {
      entries = [...INITIAL_ENTRIES];
      scenarioStep = -1;
      scenarioActive = false;
      resetScenarioUI();
      renderLog();
    }
  });
}

// ── Scenario ──────────────────────────────────────────────────────
function initScenario() {
  const btnStart = document.getElementById('btn-scenario-start');
  const btnNext  = document.getElementById('btn-scenario-next');
  const btnPrev  = document.getElementById('btn-scenario-prev');
  const btnReset = document.getElementById('btn-scenario-reset');

  if (btnStart) btnStart.addEventListener('click', startScenario);
  if (btnNext)  btnNext.addEventListener('click', nextScenarioStep);
  if (btnPrev)  btnPrev.addEventListener('click', prevScenarioStep);
  if (btnReset) btnReset.addEventListener('click', resetScenario);
}

function startScenario() {
  entries = [...INITIAL_ENTRIES];
  scenarioStep = -1;
  scenarioActive = true;
  renderLog();
  nextScenarioStep();
  document.getElementById('btn-scenario-start').style.display = 'none';
  document.getElementById('scenario-nav').style.display = 'flex';
}

function nextScenarioStep() {
  scenarioStep++;
  if (scenarioStep >= SCENARIO_STEPS.length) {
    scenarioStep = SCENARIO_STEPS.length - 1;
    return;
  }
  addEntry(SCENARIO_STEPS[scenarioStep].entry);
  updateScenarioDisplay();
}

function prevScenarioStep() {
  if (scenarioStep <= 0) return;
  scenarioStep--;
  entries = [...INITIAL_ENTRIES, ...SCENARIO_STEPS.slice(0, scenarioStep + 1).map(s => s.entry)];
  renderLog();
  updateScenarioDisplay();
}

function resetScenario() {
  entries = [...INITIAL_ENTRIES];
  scenarioStep = -1;
  scenarioActive = false;
  renderLog();
  resetScenarioUI();
}

function resetScenarioUI() {
  const btnStart = document.getElementById('btn-scenario-start');
  const nav      = document.getElementById('scenario-nav');
  const display  = document.getElementById('scenario-step-display');
  const idle     = document.getElementById('scenario-idle');
  const complete = document.getElementById('scenario-complete');

  if (btnStart) btnStart.style.display = 'inline-flex';
  if (nav)      nav.style.display = 'none';
  if (display)  display.classList.remove('visible');
  if (idle)     idle.style.display = 'block';
  if (complete) complete.classList.remove('visible');
}

function updateScenarioDisplay() {
  const step = SCENARIO_STEPS[scenarioStep];
  if (!step) return;

  const display  = document.getElementById('scenario-step-display');
  const idle     = document.getElementById('scenario-idle');
  const counter  = document.getElementById('scenario-counter');
  const heading  = document.getElementById('scenario-step-title');
  const desc     = document.getElementById('scenario-step-desc');
  const dotsEl   = document.getElementById('step-dots');
  const preview  = document.getElementById('scenario-entry-preview');
  const complete = document.getElementById('scenario-complete');
  const btnNext  = document.getElementById('btn-scenario-next');
  const btnPrev  = document.getElementById('btn-scenario-prev');

  if (idle) idle.style.display = 'none';
  if (display) display.classList.add('visible');

  if (counter) counter.textContent = `Step ${scenarioStep + 1} of ${SCENARIO_STEPS.length}`;
  if (heading) heading.textContent = step.title;
  if (desc)    desc.textContent    = step.description;

  // Dots
  if (dotsEl) {
    dotsEl.innerHTML = SCENARIO_STEPS.map((_, i) =>
      `<div class="step-dot ${i < scenarioStep ? 'done' : i === scenarioStep ? 'active' : ''}"></div>`
    ).join('');
  }

  // Entry preview
  if (preview) {
    const cfg = TYPE_CONFIG[step.entry.type];
    preview.innerHTML = `
      <div class="preview-label">Entry written to exchange.json</div>
      <div class="entry-top" style="margin-bottom:8px">
        <span class="entry-type-badge"
          style="background:${cfg.bg};color:${cfg.color};border-color:${cfg.color}40">
          ${cfg.icon} ${cfg.label}
        </span>
        <span class="entry-dir">${cfg.arrow}</span>
        <span class="entry-status status-${step.entry.status}">${step.entry.status}</span>
      </div>
      <div class="entry-route" style="margin-bottom:6px">
        <span class="from">${step.entry.from}</span>
        <span class="arrow">→</span>
        <span class="to">${step.entry.to}</span>
      </div>
      <p class="entry-content">${escHtml(step.entry.content)}</p>
    `;
  }

  // Complete banner
  const isLast = scenarioStep === SCENARIO_STEPS.length - 1;
  if (complete) complete.classList.toggle('visible', isLast);
  if (btnNext)  btnNext.disabled = isLast;
  if (btnPrev)  btnPrev.disabled = scenarioStep === 0;
}

// ── Mobile tabs ───────────────────────────────────────────────────
function initMobileTabs() {
  document.querySelectorAll('.mobile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.querySelectorAll('.panel--agent, .panel--human, .log-panel').forEach(p => {
        p.classList.remove('tab-active');
      });
      if (target === 'agent') document.querySelector('.panel--agent')?.classList.add('tab-active');
      if (target === 'human') document.querySelector('.panel--human')?.classList.add('tab-active');
      if (target === 'log')   document.querySelector('.log-panel')?.classList.add('tab-active');
    });
  });
}

// ── Helpers ───────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function flash(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = '#ef4444';
  el.placeholder = msg;
  setTimeout(() => {
    el.style.borderColor = '';
    el.placeholder = '';
  }, 2000);
}

// ── Boot ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderLog();
  initAgentComposer();
  initHumanComposer();
  initFilter();
  initClear();
  initScenario();
  initMobileTabs();

  // Default mobile tab = log
  const logTab = document.querySelector('.mobile-tab[data-tab="log"]');
  if (logTab) logTab.click();
});
