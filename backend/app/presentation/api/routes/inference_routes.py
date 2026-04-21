from fastapi import APIRouter, Depends

from app.infrastructure.di.container import get_container
from app.presentation.api.schemas.inference_schema import InferenceRequest

router = APIRouter(prefix="/inference", tags=["inference"])


@router.post("/classify")
def classify(req: InferenceRequest, container=Depends(get_container)):
    return container.inference_controller.classify(req.model_dump())


@router.post("/verify")
def verify(req: InferenceRequest, container=Depends(get_container)):
    return container.inference_controller.verify(req.model_dump())
