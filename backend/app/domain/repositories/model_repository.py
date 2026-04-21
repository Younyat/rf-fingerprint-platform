from abc import ABC, abstractmethod
from typing import List

from app.domain.entities.model_artifact import ModelArtifact


class ModelRepository(ABC):
    @abstractmethod
    def list_versions(self) -> List[ModelArtifact]:
        raise NotImplementedError

    @abstractmethod
    def get_current(self) -> ModelArtifact | None:
        raise NotImplementedError

    @abstractmethod
    def register(self, artifact: ModelArtifact) -> ModelArtifact:
        raise NotImplementedError
