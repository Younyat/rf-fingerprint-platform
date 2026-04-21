from app.domain.repositories.capture_repository import CaptureRepository


class ListCapturesUseCase:
    def __init__(self, capture_repo: CaptureRepository) -> None:
        self.capture_repo = capture_repo

    def execute(self) -> list[dict]:
        return [c.__dict__ for c in self.capture_repo.list_all()]
