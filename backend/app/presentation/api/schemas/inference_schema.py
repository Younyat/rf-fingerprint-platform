from pydantic import BaseModel


class InferenceRequest(BaseModel):
    cfile_path: str
