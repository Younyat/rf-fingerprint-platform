import json
from pathlib import Path
from typing import List

from app.domain.entities.dataset_record import DatasetRecord
from app.domain.repositories.dataset_repository import DatasetRepository


class DatasetFSRepository(DatasetRepository):
    def __init__(self, dataset_dir: Path) -> None:
        self._dataset_dir = dataset_dir
        (self._dataset_dir / "train").mkdir(parents=True, exist_ok=True)
        (self._dataset_dir / "val").mkdir(parents=True, exist_ok=True)

    def add_record(self, record: DatasetRecord) -> DatasetRecord:
        out = self._dataset_dir / record.split / f"{record.record_id}.json"
        out.write_text(json.dumps(record.__dict__, indent=2), encoding="utf-8")
        return record

    def list_records(self, split: str | None = None) -> List[DatasetRecord]:
        roots = [self._dataset_dir / split] if split else [self._dataset_dir / "train", self._dataset_dir / "val"]
        records: list[DatasetRecord] = []
        for root in roots:
            if not root.exists():
                continue
            for p in sorted(root.glob("*.json")):
                records.append(DatasetRecord(**json.loads(p.read_text(encoding="utf-8"))))
        return records

    def build_manifest(self, split: str | None = None) -> dict:
        records = self.list_records(split=split)
        return {
            "split": split or "all",
            "num_records": len(records),
            "records": [r.__dict__ for r in records],
        }
