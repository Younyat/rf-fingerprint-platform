import json
from pathlib import Path

from app.infrastructure.remote.training_job_manager import TrainingJobManager


class GetValidationJobStatusUseCase:
    def __init__(self, job_manager: TrainingJobManager) -> None:
        self.job_manager = job_manager

    def execute(self, job_id: str | None = None) -> dict:
        status = self.job_manager.get_status(job_id=job_id, job_type="validation")
        if status.get("status") not in {"completed", "failed"}:
            return status

        output_json = str((status.get("metadata") or {}).get("output_json", "")).strip()
        if not output_json:
            return status

        p = Path(output_json)
        if not p.exists():
            return status

        try:
            status["report"] = json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            pass
        return status
