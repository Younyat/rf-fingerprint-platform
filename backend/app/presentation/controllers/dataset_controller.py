from app.application.use_cases.dataset.build_dataset_manifest_use_case import BuildDatasetManifestUseCase
from app.application.use_cases.dataset.create_dataset_record_use_case import CreateDatasetRecordUseCase
from app.application.use_cases.dataset.list_dataset_records_use_case import ListDatasetRecordsUseCase
from app.application.use_cases.dataset.check_dataset_quality_use_case import CheckDatasetQualityUseCase
from app.application.use_cases.dataset.delete_dataset_records_use_case import DeleteDatasetRecordsUseCase


class DatasetController:
    def __init__(
        self,
        create_uc: CreateDatasetRecordUseCase,
        list_uc: ListDatasetRecordsUseCase,
        manifest_uc: BuildDatasetManifestUseCase,
        quality_uc: CheckDatasetQualityUseCase,
        delete_uc: DeleteDatasetRecordsUseCase,
    ) -> None:
        self.create_uc = create_uc
        self.list_uc = list_uc
        self.manifest_uc = manifest_uc
        self.quality_uc = quality_uc
        self.delete_uc = delete_uc

    def create(self, payload: dict) -> dict:
        return self.create_uc.execute(payload)

    def list_records(self, split: str | None = None) -> list[dict]:
        return self.list_uc.execute(split=split)

    def stats(self) -> dict:
        records = self.list_uc.execute(split=None)
        quality = self.quality_uc.execute(records)
        manifest = self.manifest_uc.execute(split=None)
        return {"manifest": manifest, "quality": quality}

    def delete_records(self, records: list[dict]) -> dict:
        return self.delete_uc.execute(records)
