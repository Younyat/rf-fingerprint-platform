from dataclasses import dataclass


@dataclass(frozen=True)
class RFMetadata:
    center_frequency_hz: float
    sample_rate_hz: float
    duration_seconds: float

    def validate(self) -> None:
        if self.center_frequency_hz <= 0:
            raise ValueError("center_frequency_hz must be > 0")
        if self.sample_rate_hz <= 0:
            raise ValueError("sample_rate_hz must be > 0")
        if self.duration_seconds <= 0:
            raise ValueError("duration_seconds must be > 0")
