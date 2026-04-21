from pydantic import BaseModel


class ValidationRunRequest(BaseModel):
    val_root: str = "rf_dataset_val"
    model_dir: str = "remote_trained_model"
    output_json: str = "validation_report.json"
    batch_size: int = 256
    python_exe: str = ""
