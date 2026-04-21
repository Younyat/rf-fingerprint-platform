import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List

from app.domain.entities.model_artifact import ModelArtifact
from app.domain.repositories.model_repository import ModelRepository


class ModelFSRepository(ModelRepository):
    def __init__(self, models_dir: Path) -> None:
        self._models_dir = models_dir
        self._models_dir.mkdir(parents=True, exist_ok=True)

    def register(self, artifact: ModelArtifact) -> ModelArtifact:
        p = self._models_dir / f"{artifact.version}.json"
        p.write_text(json.dumps(artifact.__dict__, indent=2), encoding="utf-8")
        current = self._models_dir / "current.txt"
        current.write_text(artifact.version, encoding="utf-8")
        return artifact

    def list_versions(self) -> List[ModelArtifact]:
        out: list[ModelArtifact] = []
        for p in sorted(self._models_dir.glob("*.json")):
            out.append(ModelArtifact(**json.loads(p.read_text(encoding="utf-8"))))
        return out

    def get_current(self) -> ModelArtifact | None:
        c = self._models_dir / "current.txt"
        if not c.exists():
            return None
        version = c.read_text(encoding="utf-8").strip()
        p = self._models_dir / f"{version}.json"
        if not p.exists():
            return None
        return ModelArtifact(**json.loads(p.read_text(encoding="utf-8")))


def now_version() -> str:
    return datetime.now(timezone.utc).strftime("model_%Y%m%dT%H%M%SZ")
