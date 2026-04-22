from pydantic import BaseModel, Field


class ValidationRunRequest(BaseModel):
    val_root: str = "rf_dataset_val"
    model_dir: str = "remote_trained_model"
    output_json: str = "validation_report.json"
    batch_size: int = 256
    python_exe: str = ""
    selected_metadata_paths: list[str] = Field(default_factory=list)
