import json
from pathlib import Path


class GetRetrainingDashboardUseCase:
    def __init__(self, model_output_dir: Path) -> None:
        self.model_output_dir = model_output_dir
        self.project_data_dir = model_output_dir.parent

    def _resolve_data_path(self, value: str | None, default_path: Path) -> Path:
        if value is None or str(value).strip() == "":
            return default_path
        p = Path(value)
        if p.is_absolute():
            return p
        return self.project_data_dir / p

    @staticmethod
    def _load_json(path: Path):
        if not path.exists():
            return None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return None

    def execute(self, payload: dict | None = None) -> dict:
        payload = payload or {}
        model_dir = self._resolve_data_path(payload.get("local_output_dir"), self.model_output_dir)
        versions_dir = model_dir / "versions"
        version_index_path = versions_dir / "index.json"
        history_path = model_dir / "training_history.json"
        manifest_path = model_dir / "dataset_manifest.json"
        label_map_path = model_dir / "label_map.json"
        profiles_path = model_dir / "enrollment_profiles.json"
        best_model_path = model_dir / "best_model.pt"

        versions_index = self._load_json(version_index_path) or {"versions": []}
        versions = versions_index.get("versions", [])
        if not isinstance(versions, list):
            versions = []

        training_history = self._load_json(history_path) or []
        if not isinstance(training_history, list):
            training_history = []

        last_epoch = training_history[-1] if training_history else {}
        best_test_acc = max([float(r.get("test_acc", 0.0)) for r in training_history], default=0.0)
        last_test_acc = float(last_epoch.get("test_acc", 0.0)) if isinstance(last_epoch, dict) else 0.0
        last_train_acc = float(last_epoch.get("train_acc", 0.0)) if isinstance(last_epoch, dict) else 0.0

        manifest = self._load_json(manifest_path) or {}
        label_map = self._load_json(label_map_path) or {}
        profiles = self._load_json(profiles_path) or {}

        device_to_label = label_map.get("device_to_label", {}) if isinstance(label_map, dict) else {}
        num_devices = len(device_to_label) if isinstance(device_to_label, dict) else 0

        dataset_records = int(manifest.get("num_records", 0)) if isinstance(manifest, dict) else 0
        total_versions = len(versions)
        latest_version = versions[-1] if versions else None

        return {
            "model_dir": str(model_dir),
            "artifacts": {
                "has_best_model": best_model_path.exists(),
                "has_training_history": history_path.exists(),
                "has_profiles": profiles_path.exists(),
                "has_manifest": manifest_path.exists(),
            },
            "kpi": {
                "num_devices": num_devices,
                "dataset_records": dataset_records,
                "total_versions": total_versions,
                "best_test_acc": best_test_acc,
                "last_test_acc": last_test_acc,
                "last_train_acc": last_train_acc,
                "history_epochs": len(training_history),
                "profiles_count": len(profiles) if isinstance(profiles, dict) else 0,
            },
            "latest_version": latest_version,
            "versions": versions,
            "history_tail": training_history[-30:],
        }
