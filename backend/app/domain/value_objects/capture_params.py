from dataclasses import dataclass


@dataclass(frozen=True)
class CaptureParams:
    emitter_device_id: str
    session_id: str
    receiver_id: str
    environment_id: str
    frequency_mhz: float
    sample_rate_hz: float
    duration_seconds: float
    gain_db: float
    split: str
