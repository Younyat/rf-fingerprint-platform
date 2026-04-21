from abc import ABC, abstractmethod

from app.domain.value_objects.remote_server_config import RemoteServerConfig
from app.domain.value_objects.training_params import TrainingParams


class RemoteTrainingRepository(ABC):
    @abstractmethod
    def launch(self, config: RemoteServerConfig, params: TrainingParams, data_root: str, output_root: str) -> dict:
        raise NotImplementedError
