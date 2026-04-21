from app.domain.repositories.model_repository import ModelRepository


class ListModelVersionsUseCase:
    def __init__(self, repo: ModelRepository) -> None:
        self.repo = repo

    def execute(self) -> list[dict]:
        return [m.__dict__ for m in self.repo.list_versions()]
