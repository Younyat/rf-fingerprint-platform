from datetime import datetime, timezone


def build_metadata(payload: dict) -> dict:
    out = dict(payload)
    out["generated_at_utc"] = datetime.now(timezone.utc).isoformat()
    return out
