# Agent-Human Interface — Live Exchange Layer Simulation

> Part of [datainsight.at](https://datainsight.at) · [Live demo](https://datainsight.at/tools/agent_human_interface/)

An interactive simulation of the **Agent-Human Interface (AHI)** — the shared, append-only log that connects AI agents and humans in agentic data pipelines.

---

## What It Does

Agents write **observations, recommendations, and alerts** upward (↑).
Humans write **orders, approvals, and overrides** downward (↓).

Every entry is typed, schema-enforced, and append-only — so nothing can be silently rewritten.

The simulation lets you:
- Watch a scripted scenario play out end-to-end
- Compose your own agent or human entries
- See how the exchange log grows as a queryable audit trail

---

## Entry Types

| Type | Direction | Written by | Purpose |
|---|---|---|---|
| `observation` | ↑ | Agent | Log what was found, no action required |
| `recommendation` | ↑ | Agent | Flag a topic or gap for human review |
| `alert` | ↑ | Agent | Urgent issue requiring immediate attention |
| `order` | ↓ | Human | Direct agent behaviour for the next run |
| `acknowledgement` | ↓ | Agent | Confirm that an order or recommendation was acted on |

---

## Files

| File | Responsibility |
|---|---|
| `index.html` | App shell — header, intro banner, three-column layout |
| `app.js` | Simulation engine, entry rendering, compose form logic |
| `style.css` | Component styles (imports `../../shared-theme.css` from parent) |

---

## Running Locally

No build step. Open `index.html` directly in a browser, or serve from the `prompt_engineer` root:

```bash
cd /path/to/prompt_engineer
python3 -m http.server 8080
# open http://localhost:8080/tools/agent_human_interface/
```

> The app loads `../../shared-theme.css` and `../../img/` from the parent repo. It will not render correctly if opened in isolation without those assets.

---

## Part of the DE Prompt Toolkit

This tool is embedded in [datainsight.at](https://datainsight.at) as a submodule of [datainsightat/prompt_engineer](https://github.com/datainsightat/prompt_engineer).

The AHI pattern is also used live by the **H.A.R.L.I.E. collective** — 7 agents that maintain the site — coordinating through `agents/exchange.json` in the parent repo.

---

## License

MIT
