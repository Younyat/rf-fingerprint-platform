from app.application.use_cases.validation.validate_model_use_case import ValidateModelUseCase


class ValidationController:
    def __init__(self, validate_uc: ValidateModelUseCase) -> None:
        self.validate_uc = validate_uc

    def run(self, payload: dict) -> dict:
        return self.validate_uc.execute(payload)
