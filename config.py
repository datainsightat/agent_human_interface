import json
import os
import secrets
from pathlib import Path

DATA_DIR = Path(os.getenv("AHI_DATA_DIR", "data"))
CONFIG_FILE = DATA_DIR / "config.json"

DEFAULT_AGENTS = [
    "scout",
    "template_engineer",
    "project_architect",
    "market_watcher",
    "pulse_writer",
    "harlie",
    "publisher",
]


def _generate_config() -> dict:
    agents = {
        name: {
            "api_key": f"ahi-{name}-{secrets.token_urlsafe(16)}",
            "description": name.replace("_", " ").title(),
        }
        for name in DEFAULT_AGENTS
    }
    config = {"agents": agents}

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    CONFIG_FILE.write_text(json.dumps(config, indent=2))

    print("\n=== Agent-Human Interface — API Keys ===")
    for name, data in agents.items():
        print(f"  {name:<20}: {data['api_key']}")
    print("=========================================\n")

    return config


def load_config() -> dict:
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text())
    return _generate_config()


CONFIG = load_config()


def get_agent_from_key(api_key: str) -> str | None:
    for name, data in CONFIG["agents"].items():
        if data["api_key"] == api_key:
            return name
    return None
