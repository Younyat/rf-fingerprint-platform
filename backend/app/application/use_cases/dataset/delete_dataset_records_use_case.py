from app.domain.repositories.dataset_repository import DatasetRepository


class DeleteDatasetRecordsUseCase:
    def __init__(self, repo: DatasetRepository) -> None:
        self.repo = repo

    def execute(self, records: list[dict]) -> dict:
        return self.repo.delete_records(records)
