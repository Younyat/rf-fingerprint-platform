from pathlib import Path

from app.infrastructure.remote.training_job_manager import TrainingJobManager


class StartCaptureJobUseCase:
    def __init__(
        self,
        job_manager: TrainingJobManager,
        scripts_dir: Path,
        train_dataset_dir: Path,
        val_dataset_dir: Path,
        predict_dataset_dir: Path,
        default_python: str,
    ) -> None:
        self.job_manager = job_manager
        self.scripts_dir = scripts_dir
        self.train_dataset_dir = train_dataset_dir
        self.val_dataset_dir = val_dataset_dir
        self.predict_dataset_dir = predict_dataset_dir
        self.default_python = default_python

    def execute(self, data: dict) -> dict:
        split = str(data.get("split", "train")).strip().lower()
        if split not in {"train", "val", "predict"}:
            split = "train"
        if split == "train":
            dataset_dir = self.train_dataset_dir
        elif split == "val":
            dataset_dir = self.val_dataset_dir
        else:
            dataset_dir = self.predict_dataset_dir
        dataset_dir.mkdir(parents=True, exist_ok=True)

        python_exe = data.get("python_exe") or self.default_python
        capture_script = self.scripts_dir / "capture_rf_fingerprint.py"

        cmd = [
            python_exe,
            str(capture_script),
            "--capture-root",
            str(dataset_dir),
            "--emitter-device-id",
            str(data["emitter_device_id"]),
            "--session-id",
            str(data["session_id"]),
            "--receiver-id",
            str(data.get("receiver_id", "usrp_b200_01")),
            "--environment-id",
            str(data.get("environment_id", "lab")),
            "--freq",
            str(float(data["frequency_mhz"])),
            "--duration",
            str(float(data["duration_seconds"])),
            "--sample-rate",
            str(float(data["sample_rate_hz"])),
            "--gain",
            str(float(data.get("gain_db", 20.0))),
        ]

        return self.job_manager.start_job(
            command=cmd,
            cwd=str(self.scripts_dir),
            metadata={
                "job_type": "capture",
                "split": split,
                "emitter_device_id": str(data.get("emitter_device_id", "")),
                "session_id": str(data.get("session_id", "")),
            },
        )
