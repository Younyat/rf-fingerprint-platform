from app.application.use_cases.training.get_training_status_use_case import GetTrainingStatusUseCase
from app.application.use_cases.training.launch_remote_training_use_case import LaunchRemoteTrainingUseCase
from app.application.use_cases.training.list_model_versions_use_case import ListModelVersionsUseCase
from app.application.use_cases.training.retrain_model_use_case import RetrainModelUseCase


class TrainingController:
    def __init__(self, launch_uc: LaunchRemoteTrainingUseCase, retrain_uc: RetrainModelUseCase, list_models_uc: ListModelVersionsUseCase, status_uc: GetTrainingStatusUseCase) -> None:
        self.launch_uc = launch_uc
        self.retrain_uc = retrain_uc
        self.list_models_uc = list_models_uc
        self.status_uc = status_uc

    def start(self, payload: dict) -> dict:
        return self.launch_uc.execute(payload)

    def retrain(self, payload: dict) -> dict:
        return self.retrain_uc.execute(payload)

    def status(self) -> dict:
        return self.status_uc.execute()

    def list_models(self) -> list[dict]:
        return self.list_models_uc.execute()
