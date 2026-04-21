from abc import ABC, abstractmethod
from typing import List

from app.domain.entities.rf_capture import RFCapture


class CaptureRepository(ABC):
    @abstractmethod
    def save(self, capture: RFCapture) -> RFCapture:
        raise NotImplementedError

    @abstractmethod
    def list_all(self) -> List[RFCapture]:
        raise NotImplementedError

    @abstractmethod
    def get(self, capture_id: str) -> RFCapture | None:
        raise NotImplementedError
