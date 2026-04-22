from fastapi import APIRouter, Depends, HTTPException

from app.infrastructure.di.container import get_container
from app.presentation.api.schemas.dataset_schema import CreateDatasetRecordRequest, DeleteDatasetRecordsRequest

router = APIRouter(prefix="/datasets", tags=["dataset"])


@router.post("/records")
def create_record(req: CreateDatasetRecordRequest, container=Depends(get_container)):
    return container.dataset_controller.create(req.model_dump())


@router.post("/delete")
def delete_records(req: DeleteDatasetRecordsRequest, container=Depends(get_container)):
    try:
        return container.dataset_controller.delete_records([r.model_dump() for r in req.records])
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/train")
def list_train(container=Depends(get_container)):
    return container.dataset_controller.list_records(split="train")


@router.get("/val")
def list_val(container=Depends(get_container)):
    return container.dataset_controller.list_records(split="val")


@router.get("/stats")
def stats(container=Depends(get_container)):
    return container.dataset_controller.stats()
