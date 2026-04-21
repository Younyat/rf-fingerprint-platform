from dataclasses import dataclass


@dataclass(frozen=True)
class ValidationParams:
    model_version: str
    dataset_root: str
    threshold_mode: str = "profile"
