from app.infrastructure.remote.training_job_manager import TrainingJobManager


class GetTrainingStatusUseCase:
    def __init__(self, job_manager: TrainingJobManager) -> None:
        self.job_manager = job_manager

    def execute(self, job_id: str | None = None) -> dict:
        return self.job_manager.get_status(job_id=job_id, job_type="training")
