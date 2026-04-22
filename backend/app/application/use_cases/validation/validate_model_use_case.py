import json
from pathlib import Path

from app.infrastructure.remote.ssh_remote_executor import SSHRemoteExecutor


class ValidateModelUseCase:
    def __init__(
        self,
        executor: SSHRemoteExecutor,
        scripts_dir: Path,
        val_dataset_dir: Path,
        model_output_dir: Path,
        validation_output_dir: Path,
        default_python: str,
    ) -> None:
        self.executor = executor
        self.scripts_dir = scripts_dir
        self.val_dataset_dir = val_dataset_dir
        self.model_output_dir = model_output_dir
        self.validation_output_dir = validation_output_dir
        self.default_python = default_python
        self.project_data_dir = val_dataset_dir.parent

    def _resolve_data_path(self, value: str | None, default_path: Path) -> Path:
        if value is None or str(value).strip() == "":
            return default_path
        p = Path(value)
        if p.is_absolute():
            return p
        return self.project_data_dir / p

    def build_command(self, payload: dict) -> tuple[list[str], Path]:
        python_exe = payload.get("python_exe") or self.default_python
        val_root = self._resolve_data_path(payload.get("val_root"), self.val_dataset_dir)
        model_dir = self._resolve_data_path(payload.get("model_dir"), self.model_output_dir)
        output_json = self._resolve_data_path(payload.get("output_json"), self.validation_output_dir / "validation_report.json")
        output_json.parent.mkdir(parents=True, exist_ok=True)

        selected_metadata_paths = payload.get("selected_metadata_paths") or []
        if not isinstance(selected_metadata_paths, list):
            raise RuntimeError("selected_metadata_paths must be a list")

        script = self.scripts_dir / "validate_rf_fingerprint.py"
        cmd = [
            python_exe,
            str(script),
            "--val-root",
            str(val_root),
            "--model-dir",
            str(model_dir),
            "--output-json",
            str(output_json),
            "--batch-size",
            str(int(payload.get("batch_size", 256))),
        ]
        for item in selected_metadata_paths:
            cmd.extend(["--selected-metadata-path", str(item)])
        return cmd, output_json

    def execute(self, payload: dict) -> dict:
        cmd, output_json = self.build_command(payload)
        result = self.executor.run(cmd, cwd=str(self.scripts_dir))
        response = {
            "command_result": result,
            "output_json": str(output_json),
            "selected_count": len(payload.get("selected_metadata_paths") or []),
        }

        if result["returncode"] == 0 and output_json.exists():
            response["report"] = json.loads(output_json.read_text(encoding="utf-8"))
        return response
