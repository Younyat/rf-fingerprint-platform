from fastapi import APIRouter, Depends

from app.infrastructure.di.container import get_container
from app.presentation.api.schemas.dataset_schema import CreateDatasetRecordRequest

router = APIRouter(prefix="/datasets", tags=["dataset"])


@router.post("/records")
def create_record(req: CreateDatasetRecordRequest, container=Depends(get_container)):
    return container.dataset_controller.create(req.model_dump())


@router.get("/train")
def list_train(container=Depends(get_container)):
    return container.dataset_controller.list_records(split="train")


@router.get("/val")
def list_val(container=Depends(get_container)):
    return container.dataset_controller.list_records(split="val")


@router.get("/stats")
def stats(container=Depends(get_container)):
    return container.dataset_controller.stats()
