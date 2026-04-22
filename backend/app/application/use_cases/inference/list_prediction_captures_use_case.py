import json
from pathlib import Path


class ListPredictionCapturesUseCase:
    def __init__(self, predict_dataset_dir: Path) -> None:
        self.predict_dataset_dir = predict_dataset_dir

    def execute(self) -> list[dict]:
        out: list[dict] = []
        if not self.predict_dataset_dir.exists():
            return out

        for meta_path in sorted(self.predict_dataset_dir.rglob("*.json")):
            try:
                meta = json.loads(meta_path.read_text(encoding="utf-8"))
            except Exception:
                continue

            iq_file = str(meta.get("iq_file", "")).strip()
            cfile_path = Path(iq_file) if iq_file else meta_path.with_suffix(".cfile")
            if not cfile_path.exists():
                continue

            out.append(
                {
                    "metadata_path": str(meta_path),
                    "cfile_path": str(cfile_path),
                    "emitter_device_id": str(meta.get("emitter_device_id", "")).strip(),
                    "session_id": str(meta.get("session_id", "")).strip(),
                    "center_frequency_hz": float(meta.get("center_frequency_hz", 0.0) or 0.0),
                    "sample_rate_hz": float(meta.get("sample_rate_hz", 0.0) or 0.0),
                    "duration_seconds": float(meta.get("duration_seconds", 0.0) or 0.0),
                }
            )
        return out
