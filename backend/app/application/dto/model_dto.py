from pydantic import BaseModel


class ModelVersionDTO(BaseModel):
    version: str
    created_at_utc: str
