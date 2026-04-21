import json
from pathlib import Path
from typing import List

from app.domain.entities.rf_capture import RFCapture
from app.domain.repositories.capture_repository import CaptureRepository


class CaptureFSRepository(CaptureRepository):
    def __init__(self, captures_dir: Path) -> None:
        self._captures_dir = captures_dir
        self._captures_dir.mkdir(parents=True, exist_ok=True)

    def save(self, capture: RFCapture) -> RFCapture:
        payload = capture.__dict__
        path = self._captures_dir / f"{capture.id}.json"
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return capture

    def list_all(self) -> List[RFCapture]:
        out: list[RFCapture] = []
        for p in sorted(self._captures_dir.glob("*.json")):
            data = json.loads(p.read_text(encoding="utf-8"))
            out.append(RFCapture(**data))
        return out

    def get(self, capture_id: str) -> RFCapture | None:
        p = self._captures_dir / f"{capture_id}.json"
        if not p.exists():
            return None
        data = json.loads(p.read_text(encoding="utf-8"))
        return RFCapture(**data)
