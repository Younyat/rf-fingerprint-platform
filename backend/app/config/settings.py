from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "RF Fingerprint Platform"
    api_prefix: str = "/api/rf"
    storage_root: str = "backend/app/infrastructure/persistence/storage"


settings = Settings()
