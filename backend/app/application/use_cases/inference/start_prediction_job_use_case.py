from pathlib import Path

from app.infrastructure.remote.training_job_manager import TrainingJobManager


class StartPredictionJobUseCase:
    def __init__(
        self,
        job_manager: TrainingJobManager,
        scripts_dir: Path,
        model_output_dir: Path,
        inference_output_dir: Path,
        default_python: str,
    ) -> None:
        self.job_manager = job_manager
        self.scripts_dir = scripts_dir
        self.model_output_dir = model_output_dir
        self.inference_output_dir = inference_output_dir
        self.default_python = default_python
        self.project_data_dir = model_output_dir.parent

    def _resolve_data_path(self, value: str | None, default_path: Path) -> Path:
        if value is None or str(value).strip() == "":
            return default_path
        p = Path(value)
        if p.is_absolute():
            return p
        return self.project_data_dir / p

    def execute(self, payload: dict) -> dict:
        python_exe = payload.get("python_exe") or self.default_python
        cfile_path = Path(str(payload["cfile_path"]))
        metadata_path = str(payload.get("metadata_path", "")).strip()
        model_dir = self._resolve_data_path(payload.get("model_dir"), self.model_output_dir)
        output_json = self._resolve_data_path(payload.get("output_json"), self.inference_output_dir / "prediction_report.json")
        output_json.parent.mkdir(parents=True, exist_ok=True)

        infer_script = self.scripts_dir / "infer_rf_fingerprint.py"
        cmd = [
            python_exe,
            str(infer_script),
            "--cfile-path",
            str(cfile_path),
            "--model-dir",
            str(model_dir),
            "--output-json",
            str(output_json),
            "--batch-size",
            str(int(payload.get("batch_size", 256))),
        ]
        if metadata_path:
            cmd.extend(["--metadata-path", metadata_path])

        return self.job_manager.start_job(
            command=cmd,
            cwd=str(self.scripts_dir),
            metadata={
                "job_type": "inference_prediction",
                "output_json": str(output_json),
                "cfile_path": str(cfile_path),
                "metadata_path": metadata_path,
            },
        )
