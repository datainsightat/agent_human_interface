import asyncio
import json
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

from fastapi import Depends, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI

from auth import create_session_token, get_caller, verify_admin_password
from config import CONFIG
from models import CreateEntry, LoginRequest
from store import append_entry, get_entries, get_entry, get_pending, init_db


# ── SSE broadcaster ────────────────────────────────────────────────────────────

class _Broadcaster:
    def __init__(self) -> None:
        self._queues: list[asyncio.Queue] = []

    async def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        self._queues.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        try:
            self._queues.remove(q)
        except ValueError:
            pass

    async def send(self, entry: dict) -> None:
        for q in list(self._queues):
            await q.put(entry)


broadcaster = _Broadcaster()


# ── App lifecycle ──────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Agent-Human Interface", version="1.0.0", lifespan=lifespan)


# ── Auth routes ────────────────────────────────────────────────────────────────

@app.post("/auth/login")
async def login(body: LoginRequest, response: Response):
    if not verify_admin_password(body.password):
        raise HTTPException(status_code=401, detail="Wrong password")
    token = create_session_token()
    response.set_cookie("ahi_session", token, httponly=True, samesite="lax")
    return {"ok": True}


@app.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("ahi_session")
    return {"ok": True}


# ── Exchange routes ────────────────────────────────────────────────────────────

@app.post("/exchange")
async def push_entry(
    body: CreateEntry,
    caller: str = Depends(get_caller),
):
    entry = body.model_dump()
    entry["from"] = caller  # server sets from — agents cannot impersonate
    stored = append_entry(entry)
    await broadcaster.send(stored)
    return stored


@app.get("/exchange/pending")
def pending(to: str, caller: str = Depends(get_caller)):
    return get_pending(to)


@app.get("/exchange/export")
def export(caller: str = Depends(get_caller)):
    content = json.dumps(get_entries(), indent=2)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=exchange.json"},
    )


@app.get("/exchange/stream")
async def stream(
    request: Request,
    to: Optional[str] = None,
    caller: str = Depends(get_caller),
):
    async def event_gen() -> AsyncGenerator[str, None]:
        q = await broadcaster.subscribe()
        try:
            yield 'data: {"type":"connected"}\n\n'
            while True:
                if await request.is_disconnected():
                    break
                try:
                    entry = await asyncio.wait_for(q.get(), timeout=15)
                    if to is None or entry.get("to") in (to, "all"):
                        yield f"data: {json.dumps(entry)}\n\n"
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
        finally:
            broadcaster.unsubscribe(q)

    return StreamingResponse(event_gen(), media_type="text/event-stream")


@app.get("/exchange/{entry_id}")
def get_one(entry_id: str, caller: str = Depends(get_caller)):
    entry = get_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@app.get("/exchange")
def list_entries(
    type: Optional[str] = None,
    to: Optional[str] = None,
    status: Optional[str] = None,
    from_: Optional[str] = None,
    caller: str = Depends(get_caller),
):
    return get_entries(type_=type, to=to, status=status, from_=from_)


# ── Agent registry ─────────────────────────────────────────────────────────────

@app.get("/agents")
def list_agents(caller: str = Depends(get_caller)):
    return {
        name: {"description": data["description"]}
        for name, data in CONFIG["agents"].items()
    }


# ── Static files (UI) — must be last ──────────────────────────────────────────
app.mount("/", StaticFiles(directory="static", html=True), name="static")
