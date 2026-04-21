from dataclasses import dataclass


@dataclass(frozen=True)
class DatasetSession:
    session_id: str
    emitter_device_id: str
    split: str
    records_count: int
