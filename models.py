from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel


class EntryType(str, Enum):
    observation = "observation"
    recommendation = "recommendation"
    alert = "alert"
    acknowledgement = "acknowledgement"
    order = "order"
    approval = "approval"
    override = "override"


class EntryStatus(str, Enum):
    pending = "pending"
    acknowledged = "acknowledged"
    acted = "acted"
    rejected = "rejected"
    noted = "noted"


class CreateEntry(BaseModel):
    """What agents (and humans via the UI) send to POST /exchange.
    The `from` field is set by the server from the authenticated identity."""

    id: str
    type: EntryType
    to: str
    date: str
    status: EntryStatus
    content: str
    context: Optional[dict[str, Any]] = None


class LoginRequest(BaseModel):
    password: str
