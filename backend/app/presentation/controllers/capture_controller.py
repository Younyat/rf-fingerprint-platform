from app.application.use_cases.capture.create_capture_use_case import CreateCaptureUseCase
from app.application.use_cases.capture.get_capture_detail_use_case import GetCaptureDetailUseCase
from app.application.use_cases.capture.get_capture_job_status_use_case import GetCaptureJobStatusUseCase
from app.application.use_cases.capture.list_captures_use_case import ListCapturesUseCase
from app.application.use_cases.capture.start_capture_job_use_case import StartCaptureJobUseCase


class CaptureController:
    def __init__(
        self,
        create_uc: CreateCaptureUseCase,
        list_uc: ListCapturesUseCase,
        get_uc: GetCaptureDetailUseCase,
        start_job_uc: StartCaptureJobUseCase,
        status_job_uc: GetCaptureJobStatusUseCase,
    ) -> None:
        self.create_uc = create_uc
        self.list_uc = list_uc
        self.get_uc = get_uc
        self.start_job_uc = start_job_uc
        self.status_job_uc = status_job_uc

    def create(self, payload: dict) -> dict:
        return self.create_uc.execute(payload).__dict__

    def list_all(self) -> list[dict]:
        return self.list_uc.execute()

    def get(self, capture_id: str) -> dict | None:
        return self.get_uc.execute(capture_id)

    def start(self, payload: dict) -> dict:
        return self.start_job_uc.execute(payload)

    def status(self, job_id: str | None = None) -> dict:
        return self.status_job_uc.execute(job_id=job_id)
