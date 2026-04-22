from pathlib import Path

from app.infrastructure.remote.remote_training_packager import build_deploy_command
from app.infrastructure.remote.training_job_manager import TrainingJobManager


class LaunchRemoteTrainingUseCase:
    def __init__(
        self,
        job_manager: TrainingJobManager,
        scripts_dir: Path,
        train_dataset_dir: Path,
        model_output_dir: Path,
        requirements_path: Path,
    ) -> None:
        self.job_manager = job_manager
        self.scripts_dir = scripts_dir
        self.train_dataset_dir = train_dataset_dir
        self.model_output_dir = model_output_dir
        self.requirements_path = requirements_path
        self.project_data_dir = train_dataset_dir.parent

    def _resolve_data_path(self, value: str | None, default_path: Path) -> Path:
        if value is None or str(value).strip() == "":
            return default_path
        p = Path(value)
        if p.is_absolute():
            return p
        return self.project_data_dir / p

    def execute(self, payload: dict) -> dict:
        deploy_script = self.scripts_dir / "deploy_remote_train.ps1"
        local_dataset = self._resolve_data_path(payload.get("local_dataset_dir"), self.train_dataset_dir)
        local_train_script = self.scripts_dir / "train_or_resume_rf_fingerprint.py"
        local_output = self._resolve_data_path(payload.get("local_output_dir"), self.model_output_dir)

        cmd = build_deploy_command(
            script_path=deploy_script,
            remote_user=payload["remote_user"],
            remote_host=payload["remote_host"],
            local_dataset_dir=local_dataset,
            local_train_script=local_train_script,
            local_output_dir=local_output,
            local_requirements=self.requirements_path,
            remote_venv_activate=payload.get("remote_venv_activate", ""),
            epochs=int(payload.get("epochs", 20)),
            batch_size=int(payload.get("batch_size", 128)),
            window_size=int(payload.get("window_size", 1024)),
            stride=int(payload.get("stride", 1024)),
        )

        return self.job_manager.start_job(
            command=cmd,
            cwd=str(self.scripts_dir),
            metadata={
                "job_type": "training",
                "remote_user": payload.get("remote_user"),
                "remote_host": payload.get("remote_host"),
                "local_dataset_dir": str(local_dataset),
                "local_output_dir": str(local_output),
            },
        )
