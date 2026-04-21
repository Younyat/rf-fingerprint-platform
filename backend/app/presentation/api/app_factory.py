from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.presentation.api.routes.capture_routes import router as capture_router
from app.presentation.api.routes.dataset_routes import router as dataset_router
from app.presentation.api.routes.training_routes import router as training_router
from app.presentation.api.routes.validation_routes import router as validation_router
from app.presentation.api.routes.inference_routes import router as inference_router
from app.presentation.api.routes.model_routes import router as model_router


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    prefix = settings.api_prefix
    app.include_router(capture_router, prefix=prefix)
    app.include_router(dataset_router, prefix=prefix)
    app.include_router(training_router, prefix=prefix)
    app.include_router(validation_router, prefix=prefix)
    app.include_router(inference_router, prefix=prefix)
    app.include_router(model_router, prefix=prefix)

    @app.get("/health")
    def health() -> dict:
        return {"status": "ok"}

    return app
