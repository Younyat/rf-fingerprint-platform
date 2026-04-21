from datetime import datetime, timezone

from app.domain.entities.dataset_record import DatasetRecord
from app.domain.repositories.dataset_repository import DatasetRepository


class CreateDatasetRecordUseCase:
    def __init__(self, repo: DatasetRepository) -> None:
        self.repo = repo

    def execute(self, data: dict) -> dict:
        rid = datetime.now(timezone.utc).strftime("rec_%Y%m%dT%H%M%S%fZ")
        record = DatasetRecord(record_id=rid, **data)
        return self.repo.add_record(record).__dict__
