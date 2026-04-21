from pydantic import BaseModel


class CreateDatasetRecordRequest(BaseModel):
    split: str
    emitter_device_id: str
    session_id: str
    cfile_path: str
    metadata_path: str
