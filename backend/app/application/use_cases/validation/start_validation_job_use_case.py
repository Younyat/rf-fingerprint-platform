from app.application.use_cases.validation.validate_model_use_case import ValidateModelUseCase
from app.infrastructure.remote.training_job_manager import TrainingJobManager


class StartValidationJobUseCase:
    def __init__(self, job_manager: TrainingJobManager, validate_uc: ValidateModelUseCase) -> None:
        self.job_manager = job_manager
        self.validate_uc = validate_uc

    def execute(self, payload: dict) -> dict:
        cmd, output_json = self.validate_uc.build_command(payload)
        selected = payload.get("selected_metadata_paths") or []
        return self.job_manager.start_job(
            command=cmd,
            cwd=str(self.validate_uc.scripts_dir),
            metadata={
                "job_type": "validation",
                "output_json": str(output_json),
                "selected_count": len(selected),
            },
        )
