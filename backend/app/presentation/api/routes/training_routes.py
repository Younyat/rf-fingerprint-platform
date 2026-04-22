from fastapi import APIRouter, Depends, HTTPException, Query

from app.infrastructure.di.container import get_container
from app.presentation.api.schemas.training_schema import LaunchTrainingRequest

router = APIRouter(prefix="/training", tags=["training"])


@router.post("/start")
def start_training(req: LaunchTrainingRequest, container=Depends(get_container)):
    try:
        return container.training_controller.start(req.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/retrain")
def retrain(req: LaunchTrainingRequest, container=Depends(get_container)):
    try:
        return container.training_controller.retrain(req.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/status")
def status(job_id: str | None = Query(default=None), container=Depends(get_container)):
    return container.training_controller.status(job_id=job_id)


@router.get("/models")
def models(container=Depends(get_container)):
    return container.training_controller.list_models()


@router.get("/dashboard")
def dashboard(local_output_dir: str | None = Query(default=None), container=Depends(get_container)):
    payload = {"local_output_dir": local_output_dir} if local_output_dir else {}
    return container.training_controller.dashboard(payload=payload)
