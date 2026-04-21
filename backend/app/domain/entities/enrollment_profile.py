from dataclasses import dataclass


@dataclass(frozen=True)
class EnrollmentProfile:
    emitter_device_id: str
    mean_distance: float
    std_distance: float
    accept_threshold: float
