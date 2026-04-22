from abc import ABC, abstractmethod
from typing import List

from app.domain.entities.dataset_record import DatasetRecord


class DatasetRepository(ABC):
    @abstractmethod
    def add_record(self, record: DatasetRecord) -> DatasetRecord:
        raise NotImplementedError

    @abstractmethod
    def list_records(self, split: str | None = None) -> List[DatasetRecord]:
        raise NotImplementedError

    @abstractmethod
    def build_manifest(self, split: str | None = None) -> dict:
        raise NotImplementedError

    @abstractmethod
    def delete_records(self, records: list[dict]) -> dict:
        raise NotImplementedError
