from fastapi import APIRouter, Depends, HTTPException, Query

from app.infrastructure.di.container import get_container
from app.presentation.api.schemas.capture_schema import CreateCaptureRequest

router = APIRouter(prefix="/captures", tags=["capture"])


@router.post("")
def create_capture(req: CreateCaptureRequest, container=Depends(get_container)):
    try:
        return container.capture_controller.create(req.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/start")
def start_capture(req: CreateCaptureRequest, container=Depends(get_container)):
    try:
        return container.capture_controller.start(req.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/status")
def capture_status(job_id: str | None = Query(default=None), container=Depends(get_container)):
    return container.capture_controller.status(job_id=job_id)


@router.get("")
def list_captures(container=Depends(get_container)):
    return container.capture_controller.list_all()


@router.get("/{capture_id}")
def get_capture(capture_id: str, container=Depends(get_container)):
    data = container.capture_controller.get(capture_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Capture not found")
    return data
