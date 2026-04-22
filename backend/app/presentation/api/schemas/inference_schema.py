from pydantic import BaseModel


class InferenceRequest(BaseModel):
    cfile_path: str


class PredictionStartRequest(BaseModel):
    cfile_path: str
    metadata_path: str = ""
    model_dir: str = "remote_trained_model"
    output_json: str = "inference/prediction_report.json"
    batch_size: int = 256
    python_exe: str = ""
