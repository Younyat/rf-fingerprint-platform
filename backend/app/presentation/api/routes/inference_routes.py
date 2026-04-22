from fastapi import APIRouter, Depends, Query

from app.infrastructure.di.container import get_container
from app.presentation.api.schemas.inference_schema import InferenceRequest, PredictionStartRequest

router = APIRouter(prefix="/inference", tags=["inference"])


@router.post("/classify")
def classify(req: InferenceRequest, container=Depends(get_container)):
    return container.inference_controller.classify(req.model_dump())


@router.post("/verify")
def verify(req: InferenceRequest, container=Depends(get_container)):
    return container.inference_controller.verify(req.model_dump())


@router.get("/predict/captures")
def list_prediction_captures(container=Depends(get_container)):
    return container.inference_controller.list_prediction_captures()


@router.post("/predict/start")
def start_prediction(req: PredictionStartRequest, container=Depends(get_container)):
    return container.inference_controller.start_prediction(req.model_dump())


@router.get("/predict/status")
def prediction_status(job_id: str | None = Query(default=None), container=Depends(get_container)):
    return container.inference_controller.prediction_status(job_id=job_id)
