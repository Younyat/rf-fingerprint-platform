import json
from pathlib import Path


class ExportValidationReportUseCase:
    def execute(self, report: dict, output_path: str) -> dict:
        p = Path(output_path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(report, indent=2), encoding="utf-8")
        return {"saved": str(p)}
