from dataclasses import dataclass


@dataclass(frozen=True)
class ValidationResult:
    run_id: str
    model_version: str
    accuracy: float
    macro_f1: float
    report_path: str
