from dataclasses import dataclass


@dataclass(frozen=True)
class RemoteServerConfig:
    host: str
    user: str
    python_path: str = "python3"
    venv_activate: str = ""
    remote_work_dir: str = "/tmp/rf_train_job"
