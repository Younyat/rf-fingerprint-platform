from dataclasses import dataclass


@dataclass(frozen=True)
class DatasetRecord:
    record_id: str
    split: str
    emitter_device_id: str
    session_id: str
    cfile_path: str
    metadata_path: str
