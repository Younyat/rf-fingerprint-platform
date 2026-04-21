from pydantic import BaseModel


class LaunchTrainingRequest(BaseModel):
    remote_user: str
    remote_host: str
    remote_venv_activate: str = ""
    epochs: int = 20
    batch_size: int = 128
    window_size: int = 1024
    stride: int = 1024
    local_dataset_dir: str = "rf_dataset"
    local_output_dir: str = "remote_trained_model"
