from app.domain.repositories.dataset_repository import DatasetRepository


class BuildDatasetManifestUseCase:
    def __init__(self, repo: DatasetRepository) -> None:
        self.repo = repo

    def execute(self, split: str | None = None) -> dict:
        return self.repo.build_manifest(split=split)
