import json
from pathlib import Path
from typing import List

from app.domain.entities.validation_result import ValidationResult
from app.domain.repositories.validation_repository import ValidationRepository


class ValidationFSRepository(ValidationRepository):
    def __init__(self, reports_dir: Path) -> None:
        self._reports_dir = reports_dir
        self._reports_dir.mkdir(parents=True, exist_ok=True)

    def save(self, result: ValidationResult) -> ValidationResult:
        p = self._reports_dir / f"{result.run_id}.json"
        p.write_text(json.dumps(result.__dict__, indent=2), encoding="utf-8")
        return result

    def list_all(self) -> List[ValidationResult]:
        out: list[ValidationResult] = []
        for p in sorted(self._reports_dir.glob("*.json")):
            out.append(ValidationResult(**json.loads(p.read_text(encoding="utf-8"))))
        return out
