from app.application.use_cases.capture.create_capture_use_case import CreateCaptureUseCase
from app.application.use_cases.capture.get_capture_detail_use_case import GetCaptureDetailUseCase
from app.application.use_cases.capture.list_captures_use_case import ListCapturesUseCase


class CaptureController:
    def __init__(self, create_uc: CreateCaptureUseCase, list_uc: ListCapturesUseCase, get_uc: GetCaptureDetailUseCase) -> None:
        self.create_uc = create_uc
        self.list_uc = list_uc
        self.get_uc = get_uc

    def create(self, payload: dict) -> dict:
        return self.create_uc.execute(payload).__dict__

    def list_all(self) -> list[dict]:
        return self.list_uc.execute()

    def get(self, capture_id: str) -> dict | None:
        return self.get_uc.execute(capture_id)
