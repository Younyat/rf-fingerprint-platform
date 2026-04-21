from pydantic import BaseModel


class ModelResponse(BaseModel):
    version: str
    created_at_utc: str
