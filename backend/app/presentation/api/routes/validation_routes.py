from fastapi import APIRouter, Depends, HTTPException, Query

from app.infrastructure.di.container import get_container
from app.presentation.api.schemas.validation_schema import ValidationRunRequest

router = APIRouter(prefix="/validation", tags=["validation"])


@router.post("/run")
def run_validation(req: ValidationRunRequest, container=Depends(get_container)):
    try:
        return container.validation_controller.run(req.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/start")
def start_validation(req: ValidationRunRequest, container=Depends(get_container)):
    try:
        return container.validation_controller.start(req.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/status")
def validation_status(job_id: str | None = Query(default=None), container=Depends(get_container)):
    return container.validation_controller.status(job_id=job_id)


@router.get("/reports")
def list_reports(container=Depends(get_container)):
    return [r.__dict__ for r in container.validation_repo.list_all()]
