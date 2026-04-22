import json
from datetime import datetime, timezone
from pathlib import Path

from app.domain.entities.rf_capture import RFCapture
from app.domain.repositories.capture_repository import CaptureRepository
from app.infrastructure.remote.ssh_remote_executor import SSHRemoteExecutor


class CreateCaptureUseCase:
    def __init__(
        self,
        capture_repo: CaptureRepository,
        executor: SSHRemoteExecutor,
        scripts_dir: Path,
        train_dataset_dir: Path,
        val_dataset_dir: Path,
        predict_dataset_dir: Path,
        default_python: str,
    ) -> None:
        self.capture_repo = capture_repo
        self.executor = executor
        self.scripts_dir = scripts_dir
        self.train_dataset_dir = train_dataset_dir
        self.val_dataset_dir = val_dataset_dir
        self.predict_dataset_dir = predict_dataset_dir
        self.default_python = default_python

    def execute(self, data: dict) -> RFCapture:
        capture_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
        split = data.get("split", "train").strip().lower()
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

        result = self.executor.run(cmd, cwd=str(self.scripts_dir))
        if result["returncode"] != 0:
            raise RuntimeError(result.get("stderr") or result.get("stdout") or "Capture command failed")

        metadata_path = self._find_latest_metadata(
            dataset_dir=dataset_dir,
            emitter_device_id=str(data["emitter_device_id"]),
            session_id=str(data["session_id"]),
        )
        if metadata_path is None:
            raise RuntimeError("Capture finished but metadata JSON was not found")

        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        iq_path = Path(metadata.get("iq_file", ""))
        if not iq_path.exists():
            iq_path = metadata_path.with_suffix(".cfile")

        entity = RFCapture(
            id=capture_id,
            cfile_path=str(iq_path),
            metadata_path=str(metadata_path),
            emitter_device_id=str(metadata.get("emitter_device_id", data["emitter_device_id"])),
            session_id=str(metadata.get("session_id", data["session_id"])),
            center_frequency_hz=float(metadata.get("center_frequency_hz", float(data["frequency_mhz"]) * 1e6)),
            sample_rate_hz=float(metadata.get("sample_rate_hz", data["sample_rate_hz"])),
            duration_seconds=float(metadata.get("duration_seconds", data["duration_seconds"])),
        )
        return self.capture_repo.save(entity)

    @staticmethod
    def _find_latest_metadata(dataset_dir: Path, emitter_device_id: str, session_id: str) -> Path | None:
        target_dir = dataset_dir / emitter_device_id / session_id
        if not target_dir.exists():
            return None
        files = sorted(target_dir.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
        return files[0] if files else None
