from pydantic import BaseModel


class ValidationRunDTO(BaseModel):
    model_version: str
    dataset_split: str = "val"
