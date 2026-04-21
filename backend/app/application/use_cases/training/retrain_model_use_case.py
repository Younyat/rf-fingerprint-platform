from app.application.use_cases.training.launch_remote_training_use_case import LaunchRemoteTrainingUseCase


class RetrainModelUseCase:
    def __init__(self, launch_uc: LaunchRemoteTrainingUseCase) -> None:
        self.launch_uc = launch_uc

    def execute(self, payload: dict) -> dict:
        return self.launch_uc.execute(payload)
