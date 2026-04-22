from pydantic import BaseModel


class CreateDatasetRecordRequest(BaseModel):
    split: str
    emitter_device_id: str
    session_id: str
    cfile_path: str
    metadata_path: str


class DeleteDatasetRecordItem(BaseModel):
    split: str | None = None
    emitter_device_id: str | None = None
    session_id: str | None = None
    cfile_path: str | None = None
    metadata_path: str


class DeleteDatasetRecordsRequest(BaseModel):
    records: list[DeleteDatasetRecordItem]
