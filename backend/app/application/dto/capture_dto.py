from pydantic import BaseModel


class CreateCaptureDTO(BaseModel):
    emitter_device_id: str
    session_id: str
    receiver_id: str = "usrp_b200_01"
    environment_id: str = "lab"
    frequency_mhz: float
    sample_rate_hz: float = 10_000_000
    duration_seconds: float = 5.0
    gain_db: float = 20.0
    split: str = "train"
