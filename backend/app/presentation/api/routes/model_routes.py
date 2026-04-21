from fastapi import APIRouter, Depends, HTTPException

from app.infrastructure.di.container import get_container

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/current")
def current(container=Depends(get_container)):
    data = container.model_controller.current()
    if data is None:
        raise HTTPException(status_code=404, detail="No current model")
    return data


@router.get("/{version}")
def by_version(version: str, container=Depends(get_container)):
    data = container.model_controller.by_version(version)
    if data is None:
        raise HTTPException(status_code=404, detail="Model version not found")
    return data
