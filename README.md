# Agent-Human Interface

A Docker-packaged service that acts as the structured exchange layer between autonomous agents and human operators. Agents push observations and recommendations via HTTP; humans read and respond through a browser UI; agents poll for orders before every run.

---

## The Problem It Solves

A shared `exchange.json` file works for local simulation but breaks in production:

| Issue | File-based | This service |
|---|---|---|
| Concurrent writes | Race conditions | Serialized, atomic (SQLite WAL) |
| Human input | Edit raw JSON | Form UI, no JSON required |
| Real-time updates | Re-read file | Server-Sent Events stream |
| Remote agents | Must share filesystem | HTTP from anywhere |
| Audit trail | Git blame | Server timestamp + verified agent identity |
| Schema validation | Convention | Enforced at API boundary |
| Multi-project | One file per repo | One service, multiple namespaces (future) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  agent-human-interface                   │
│                                                          │
│  ┌──────────┐    ┌──────────────────┐    ┌───────────┐  │
│  │ HTTP API │    │  Exchange Store  │    │  Web UI   │  │
│  │  :8080   │───▶│  SQLite (WAL)    │◀───│  browser  │  │
│  └──────────┘    │  /data/exchange  │    └───────────┘  │
│                  └──────────────────┘                    │
│  Volume: /data/exchange.db  /data/config.json            │
└──────────────────────────────────────────────────────────┘
         ▲  POST /exchange                 ▲ browser
         │  GET  /exchange/pending         │
    ┌────┴────┐                       ┌────┴────┐
    │  Agent  │                       │  Human  │
    └─────────┘                       └─────────┘
```

Single container. No external dependencies. Persistence is a mounted volume.

---

## Entry Format

Agents send and receive the same JSON entry shape. The `from` field is **always set by the server** from the agent's API key — agents cannot impersonate each other.

```json
{
  "id": "scout-20260312-001",
  "type": "recommendation",
  "from": "scout",
  "to": "project_architect",
  "date": "2026-03-12",
  "status": "pending",
  "content": "Kafka 4.2 Share Groups GA — no case study exists.",
  "context": { "suggested_slug": "kafka-share-groups", "priority": "high" }
}
```

### Entry types

| type | direction | written by | purpose |
|---|---|---|---|
| `observation` | ↑ up | agent | "I noticed this" — no action implied |
| `recommendation` | ↑ up | agent | "I suggest this action" — addressed to a specific agent or human |
| `alert` | ↑ up | agent | Anomaly requiring immediate attention |
| `acknowledgement` | ↕ any | agent | Confirms receipt; records action taken |
| `order` | ↓ down | human | Directive to an agent |
| `approval` | ↓ down | human | Confirms a recommendation should proceed |
| `override` | ↓ down | human | Cancel or modify something an agent planned |

### Status lifecycle

```
pending → acknowledged → acted
pending → rejected
observation / alert → noted
```

---

## API

```
POST   /exchange                Push an entry (agents via API key, humans via session)
GET    /exchange                Full log  (?type=order&to=scout&status=pending&from=scout)
GET    /exchange/pending?to=X   Shortcut: pending entries addressed to agent X
GET    /exchange/stream         SSE stream — real-time feed of new entries (?to=X to filter)
GET    /exchange/{id}           Single entry lookup
GET    /exchange/export         Download full log as exchange.json
GET    /agents                  List registered agents (no API keys)
POST   /auth/login              Human login → sets session cookie
POST   /auth/logout             Clear session cookie
```

All endpoints require either:
- `Authorization: Bearer <agent-api-key>` (agents)
- Session cookie after `POST /auth/login` (humans)

---

## Quickstart

```bash
git clone <this-repo>
cd agent_human_interface

# Optional: set admin password (default: "admin")
export AHI_ADMIN_PASSWORD=yourpassword

docker compose up
```

Open `http://localhost:8080` — sign in with your admin password.

On first boot, the container generates API keys for all default agents and prints them to stdout:

```
=== Agent-Human Interface — API Keys ===
  scout               : ahi-scout-xK9mP2...
  template_engineer   : ahi-template_engineer-aB3nQ7...
  project_architect   : ahi-project_architect-cD5rS1...
  market_watcher      : ahi-market_watcher-eF7tU4...
  pulse_writer        : ahi-pulse_writer-gH9vW6...
  harlie              : ahi-harlie-iJ1xY8...
=========================================
```

Copy each key into the corresponding agent's environment.

---

## How Agents Use It

### Before starting work — poll for pending orders

```python
import httpx

AHI_HOST = "http://localhost:8080"
API_KEY  = "ahi-scout-xK9mP2..."

def get_pending(to: str) -> list[dict]:
    r = httpx.get(f"{AHI_HOST}/exchange/pending",
                  params={"to": to},
                  headers={"Authorization": f"Bearer {API_KEY}"})
    r.raise_for_status()
    return r.json()

orders = get_pending("scout")
# act on orders before doing regular work
```

### After doing work — push an entry

```python
def push(entry: dict) -> dict:
    r = httpx.post(f"{AHI_HOST}/exchange",
                   json=entry,
                   headers={"Authorization": f"Bearer {API_KEY}"})
    r.raise_for_status()
    return r.json()   # returned entry includes server-assigned created_at

push({
    "id": "scout-20260312-001",
    "type": "recommendation",
    "to": "project_architect",
    "date": "2026-03-12",
    "status": "pending",
    "content": "Kafka 4.2 Share Groups GA — no case study exists.",
    "context": {"suggested_slug": "kafka-share-groups", "priority": "high"}
})
```

### Or subscribe to the SSE stream (event-driven)

```python
import sseclient, json

with httpx.stream("GET", f"{AHI_HOST}/exchange/stream",
                  params={"to": "scout"},
                  headers={"Authorization": f"Bearer {API_KEY}"}) as r:
    for event in sseclient.SSEClient(r):
        entry = json.loads(event.data)
        if entry.get("type") == "connected":
            continue
        handle(entry)
```

---

## How the Human Uses It

Open `http://localhost:8080`.

**Left panel — Exchange Log**
- Append-only timeline, newest first
- Color-coded by entry type
- Filter by type and agent
- SSE-connected — updates live without refresh

**Right panel — Compose**
- Choose type: Order / Approval / Override
- Choose target agent
- Write content (plain English)
- Optionally add context as JSON
- Submit — appears as `from: human`

No JSON editing. No file access required.

---

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `AHI_ADMIN_PASSWORD` | `admin` | Human login password |
| `AHI_SECRET` | random per boot | Signs session cookies |
| `AHI_DATA_DIR` | `/data` | Where `exchange.db` and `config.json` live |

Agent API keys are stored in `$AHI_DATA_DIR/config.json`. To rotate a key, delete the entry and restart — a new key will be generated and printed to stdout.

---

## Project Structure

```
agent_human_interface/
├── main.py            FastAPI app — routes, SSE broadcaster, startup
├── store.py           SQLite storage layer (append-only enforced)
├── models.py          Pydantic entry schema and enums
├── auth.py            API key + session cookie authentication
├── config.py          Config loading and auto-generation
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── static/
│   ├── index.html     Web UI (login modal + exchange log + compose form)
│   ├── style.css      Dark theme
│   └── app.js         SSE client, log rendering, compose form
└── data/              Mounted volume — exchange.db + config.json (gitignored)
```

---

## Extending

**Webhooks** — add a `webhooks` array to `config.json`. On each new entry, fan-out a POST to registered URLs.

**Multiple namespaces** — add a `?namespace=<project>` query param to all endpoints. One service, multiple independent exchange logs.

**Agent SDK package** — publish `ahi-client` to PyPI with `ahi.push()`, `ahi.pending()`, `ahi.stream()` wrapping the HTTP calls. Agents import one package instead of writing raw httpx.

**Audit export** — `GET /exchange/export` already returns the full log as `exchange.json`. Schedule a cron to commit this to a git repo for a permanent, queryable audit trail.
