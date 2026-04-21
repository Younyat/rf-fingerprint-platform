from dataclasses import dataclass


@dataclass(frozen=True)
class ModelArtifact:
    version: str
    best_model_path: str
    training_history_path: str
    enrollment_profiles_path: str
    manifest_path: str
    created_at_utc: str
