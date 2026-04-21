from app.domain.repositories.capture_repository import CaptureRepository


class GetCaptureDetailUseCase:
    def __init__(self, capture_repo: CaptureRepository) -> None:
        self.capture_repo = capture_repo

    def execute(self, capture_id: str) -> dict | None:
        c = self.capture_repo.get(capture_id)
        return None if c is None else c.__dict__
