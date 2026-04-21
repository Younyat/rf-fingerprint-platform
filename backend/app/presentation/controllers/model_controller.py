from app.domain.repositories.model_repository import ModelRepository


class ModelController:
    def __init__(self, model_repo: ModelRepository) -> None:
        self.model_repo = model_repo

    def current(self) -> dict | None:
        m = self.model_repo.get_current()
        return None if m is None else m.__dict__

    def by_version(self, version: str) -> dict | None:
        for item in self.model_repo.list_versions():
            if item.version == version:
                return item.__dict__
        return None
