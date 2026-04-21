from pydantic import BaseModel


class InferenceDTO(BaseModel):
    cfile_path: str
