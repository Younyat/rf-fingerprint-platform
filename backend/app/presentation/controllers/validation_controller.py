from app.application.use_cases.validation.get_validation_job_status_use_case import GetValidationJobStatusUseCase
from app.application.use_cases.validation.start_validation_job_use_case import StartValidationJobUseCase
from app.application.use_cases.validation.validate_model_use_case import ValidateModelUseCase


class ValidationController:
    def __init__(
        self,
        validate_uc: ValidateModelUseCase,
        start_job_uc: StartValidationJobUseCase,
        status_job_uc: GetValidationJobStatusUseCase,
    ) -> None:
        self.validate_uc = validate_uc
        self.start_job_uc = start_job_uc
        self.status_job_uc = status_job_uc

    def run(self, payload: dict) -> dict:
        return self.validate_uc.execute(payload)

    def start(self, payload: dict) -> dict:
        return self.start_job_uc.execute(payload)

    def status(self, job_id: str | None = None) -> dict:
        return self.status_job_uc.execute(job_id=job_id)
