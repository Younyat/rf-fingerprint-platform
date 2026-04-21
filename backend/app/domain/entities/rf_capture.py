from dataclasses import dataclass


@dataclass(frozen=True)
class RFCapture:
    id: str
    cfile_path: str
    metadata_path: str
    emitter_device_id: str
    session_id: str
    center_frequency_hz: float
    sample_rate_hz: float
    duration_seconds: float
