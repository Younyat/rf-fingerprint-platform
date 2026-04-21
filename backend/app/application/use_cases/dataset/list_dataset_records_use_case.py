from app.domain.repositories.dataset_repository import DatasetRepository


class ListDatasetRecordsUseCase:
    def __init__(self, repo: DatasetRepository) -> None:
        self.repo = repo

    def execute(self, split: str | None = None) -> list[dict]:
        return [r.__dict__ for r in self.repo.list_records(split=split)]
