import hashlib
import hmac
import os
import secrets
from typing import Optional

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from config import get_agent_from_key

ADMIN_PASSWORD = os.getenv("AHI_ADMIN_PASSWORD", "admin")
SECRET = os.getenv("AHI_SECRET", secrets.token_hex(32))

_bearer = HTTPBearer(auto_error=False)


# ── Session tokens (HMAC-signed, not JWT) ─────────────────────────────────────

def _sign(token: str) -> str:
    return hmac.new(SECRET.encode(), token.encode(), hashlib.sha256).hexdigest()


def create_session_token() -> str:
    token = secrets.token_urlsafe(32)
    return f"{token}.{_sign(token)}"


def verify_session_token(token: str) -> bool:
    try:
        tok, sig = token.rsplit(".", 1)
        return hmac.compare_digest(sig, _sign(tok))
    except Exception:
        return False


def verify_admin_password(password: str) -> bool:
    return secrets.compare_digest(password, ADMIN_PASSWORD)


# ── FastAPI dependencies ───────────────────────────────────────────────────────

def get_agent(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> str:
    """Require a valid agent API key. Returns the agent name."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing API key")
    agent = get_agent_from_key(credentials.credentials)
    if not agent:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return agent


def get_caller(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> str:
    """Accept either an agent API key or a valid human session cookie.
    Returns the agent name, or 'human' for authenticated humans."""
    if credentials:
        agent = get_agent_from_key(credentials.credentials)
        if agent:
            return agent

    token = request.cookies.get("ahi_session")
    if token and verify_session_token(token):
        return "human"

    raise HTTPException(status_code=401, detail="Authentication required")
