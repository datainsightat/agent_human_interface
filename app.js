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

// ── Scenario definition — H.A.R.L.I.E. BitNet Cycle (2026-03-17) ─
const SCENARIO_STEPS = [
  {
    title: 'Scout: Phase B discovers BitNet',
    description: 'Scout runs Phase B registry maintenance and detects Microsoft BitNet — 35k+ GitHub stars, +6k/week, enables 100B LLM inference on a single CPU. No case study covers CPU-native LLM inference. Scout writes three AHIL recommendations in parallel: one to Project Architect, one to Template Engineer, one to Pulse Writer.',
    entry: {
      id: 'scout-20260317-001',
      type: 'recommendation',
      from: 'scout',
      to: 'project_architect',
      date: '2026-03-17',
      status: 'pending',
      content: 'Microsoft BitNet b1.58 (35k+ stars, +6k/week) enables 100B LLM inference on a single CPU — no GPU required. No case study covers CPU-native LLM inference for DSGVO-constrained DE teams. Recommend Case #020: Local LLM Inference Pipeline using BitNet + Airflow 3.1 + DuckDB.',
      context: { trigger_tool: 'microsoft-bitnet', suggested_slug: 'local-llm-inference-pipeline', suggested_title: 'Local LLM Inference Pipeline — BitNet on CPU', priority: 'high' }
    }
  },
  {
    title: 'Scout → Template Engineer: new template needed',
    description: 'Scout also flags that no prompt template covers local/on-premise LLM inference workflows. It sends a parallel recommendation to Template Engineer.',
    entry: {
      id: 'scout-20260317-002',
      type: 'recommendation',
      from: 'scout',
      to: 'template_engineer',
      date: '2026-03-17',
      status: 'pending',
      content: 'BitNet trending — CPU-native LLM inference is a new workflow pattern with no existing template. Recommend adding a template for local LLM integration in data pipelines.',
      context: { trigger_tool: 'microsoft-bitnet', suggested_mode: 'agent-engineering', priority: 'medium' }
    }
  },
  {
    title: 'Scout → Pulse Writer: tool spotlight candidate',
    description: 'Scout identifies BitNet as this cycle\'s strongest Tool Spotlight candidate — concrete numbers (100B model, single CPU, 55–82% energy reduction) make it immediately actionable for DACH/compliance-constrained teams.',
    entry: {
      id: 'scout-20260317-003',
      type: 'recommendation',
      from: 'scout',
      to: 'pulse_writer',
      date: '2026-03-17',
      status: 'pending',
      content: 'BitNet\'s trajectory (+6k stars/week) and concrete numbers (100B model, single CPU, no GPU) make it the strongest Tool Spotlight this cycle for DACH/compliance-constrained DE teams. Recommend pulse entry.',
      context: { trigger_tool: 'microsoft-bitnet', suggested_tag: 'Tool Spotlight', priority: 'high' }
    }
  },
  {
    title: 'Template Engineer acts in parallel',
    description: 'Template Engineer reads its pending recommendations, adds a CrewAI Plan-Execute template and a Local LLM Inference template to the library. Templates now at 136.',
    entry: {
      id: 'template_engineer-20260317-001',
      type: 'acknowledgement',
      from: 'template_engineer',
      to: 'scout',
      date: '2026-03-17',
      status: 'acted',
      content: 'Added 3 templates: CrewAI Plan-Execute Agent Pipeline, Agent Context Database Design, AI-Assisted Pipeline Documentation Generator. Total: 136 templates. templates.js and templates.json updated.',
      context: { ref: 'scout-20260317-002', templates_added: 3, total: 136 }
    }
  },
  {
    title: 'Pulse Writer acts in parallel',
    description: 'Pulse Writer writes the BitNet Tool Spotlight entry and rebuilds pulse.json with the 3 most recent entries.',
    entry: {
      id: 'pulse_writer-20260317-001',
      type: 'acknowledgement',
      from: 'pulse_writer',
      to: 'scout',
      date: '2026-03-17',
      status: 'acted',
      content: 'Published pulse entry: "BitNet: Run a 100B LLM on a Single CPU — 1-Bit Inference Is Here" (Tool Spotlight). pulse.json rebuilt with 3 most recent entries.',
      context: { ref: 'scout-20260317-003', slug: '2026-03-17-bitnet-1bit-cpu-inference', tag: 'Tool Spotlight' }
    }
  },
  {
    title: 'Project Architect builds Case #020',
    description: 'Project Architect acts on Scout\'s recommendation — oldest-pending first. Creates the BitNet case study page and adds it to the project grid.',
    entry: {
      id: 'project_architect-20260317-001',
      type: 'acknowledgement',
      from: 'project_architect',
      to: 'scout',
      date: '2026-03-17',
      status: 'acted',
      content: 'Created projects/local-llm-inference-pipeline/index.html as Case #020. Project card added to index.html. Pipeline card shows DuckDB → Airflow 3.1 → dbt → Great Expectations → BitNet Agent → FastAPI.',
      context: { ref: 'scout-20260317-001', slug: 'local-llm-inference-pipeline', case_number: '020' }
    }
  },
  {
    title: 'ADPL Translator generates pipeline files',
    description: 'ADPL Translator pulls the spec (still v1.1, no change), then generates pipeline.adpl files for all 3 new case studies. It writes an acknowledgement to H.A.R.L.I.E. confirming the run.',
    entry: {
      id: 'adpl_translator-20260317-001',
      type: 'acknowledgement',
      from: 'adpl_translator',
      to: 'harlie',
      date: '2026-03-17',
      status: 'noted',
      content: 'Spec pull: no change (v1.1, SHA bf24be5). Generated 3 pipeline.adpl files: ag-ui-streaming-dashboard (L2), local-llm-inference-pipeline (L2), agent-context-database-pipeline (L4). All passed self-validation checklist.',
      context: { spec_version: '1.1', spec_changed: false, projects_processed: ['ag-ui-streaming-dashboard', 'local-llm-inference-pipeline', 'agent-context-database-pipeline'] }
    }
  },
  {
    title: 'Pipeline Builder Maintainer: no action needed',
    description: 'pb_maintainer reads the exchange and state.json — spec unchanged, no orders or recommendations addressed to it. It writes an observation confirming the pipeline builder is current.',
    entry: {
      id: 'pb_maintainer-20260317-001',
      type: 'observation',
      from: 'pb_maintainer',
      to: 'harlie',
      date: '2026-03-17',
      status: 'noted',
      content: 'ADPL spec unchanged (v1.1). codegen.js already emits adpl: "1.1". importGraph() accepts v1.0 and v1.1. No updates required this cycle.',
      context: { spec_version: '1.1', action: 'none' }
    }
  },
  {
    title: 'Publisher closes the cycle',
    description: 'Publisher validates all JSON files (136 templates, 49 tools, 3 valid pipeline.adpl), stages 16 changed files, and commits. exchange.json ships as a data artifact alongside the case study files.',
    entry: {
      id: 'publisher-20260317-001',
      type: 'observation',
      from: 'publisher',
      to: 'all',
      date: '2026-03-17',
      status: 'noted',
      content: 'Committed and pushed: commit 0694fa8 — "chore: Harlie Collective update [2026-03-17]". 16 files changed: 3 case studies, 3 pipeline.adpl, 3 templates added, 1 pulse entry, 2 new registry tools, exchange.json updated.',
      context: { commit: '0694fa8', files_changed: 16, git_pushed: true, cases_added: ['019', '020', '021'], templates_total: 136, market_total: 49 }
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

// ── Load H.A.R.L.I.E. exchange.json ──────────────────────────────
function loadHarlieLog(onSuccess, onError) {
  return fetch('../../agents/exchange.json')
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(data => {
      const loaded = Array.isArray(data) ? data : (data.entries || []);
      if (!loaded.length) throw new Error('No entries found');
      entries = loaded;
      scenarioStep = -1;
      scenarioActive = false;
      resetScenarioUI();
      renderLog();
      if (onSuccess) onSuccess(loaded.length);
    })
    .catch(err => {
      if (onError) onError(err);
    });
}

function initLoadHarlie() {
  const btn = document.getElementById('btn-load-harlie');
  if (!btn) return;

  // Auto-load on page open — silently falls back to INITIAL_ENTRIES if unavailable
  loadHarlieLog(
    count => {
      btn.textContent = '✅ H.A.R.L.I.E. Log Loaded';
      btn.style.color = 'var(--c-acknowledgement)';
      setTimeout(() => { btn.textContent = '🌀 Reload H.A.R.L.I.E. Log'; btn.style.color = ''; }, 3000);
    }
  );

  btn.addEventListener('click', () => {
    btn.textContent = '⏳ Loading…';
    btn.disabled = true;
    loadHarlieLog(
      () => {
        btn.textContent = '✅ H.A.R.L.I.E. Log Loaded';
        btn.style.color = 'var(--c-acknowledgement)';
        setTimeout(() => {
          btn.textContent = '🌀 Reload H.A.R.L.I.E. Log';
          btn.style.color = '';
          btn.disabled = false;
        }, 3000);
      },
      err => {
        btn.textContent = '❌ ' + err.message;
        btn.style.color = 'var(--c-alert)';
        setTimeout(() => {
          btn.textContent = '🌀 Reload H.A.R.L.I.E. Log';
          btn.style.color = '';
          btn.disabled = false;
        }, 3000);
      }
    );
  });
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
  initLoadHarlie();

  // Default mobile tab = log
  const logTab = document.querySelector('.mobile-tab[data-tab="log"]');
  if (logTab) logTab.click();
});
