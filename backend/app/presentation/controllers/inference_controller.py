from app.application.use_cases.inference.classify_capture_use_case import ClassifyCaptureUseCase
from app.application.use_cases.inference.detect_unknown_device_use_case import DetectUnknownDeviceUseCase
from app.application.use_cases.inference.get_prediction_job_status_use_case import GetPredictionJobStatusUseCase
from app.application.use_cases.inference.list_prediction_captures_use_case import ListPredictionCapturesUseCase
from app.application.use_cases.inference.start_prediction_job_use_case import StartPredictionJobUseCase
from app.application.use_cases.inference.verify_capture_use_case import VerifyCaptureUseCase


class InferenceController:
    def __init__(
        self,
        classify_uc: ClassifyCaptureUseCase,
        verify_uc: VerifyCaptureUseCase,
        detect_uc: DetectUnknownDeviceUseCase,
        list_prediction_captures_uc: ListPredictionCapturesUseCase,
        start_prediction_job_uc: StartPredictionJobUseCase,
        prediction_status_uc: GetPredictionJobStatusUseCase,
    ) -> None:
        self.classify_uc = classify_uc
        self.verify_uc = verify_uc
        self.detect_uc = detect_uc
        self.list_prediction_captures_uc = list_prediction_captures_uc
        self.start_prediction_job_uc = start_prediction_job_uc
        self.prediction_status_uc = prediction_status_uc

    def classify(self, payload: dict) -> dict:
        return self.classify_uc.execute(payload)

    def verify(self, payload: dict) -> dict:
        return self.verify_uc.execute(payload)

    def detect_unknown(self, payload: dict) -> dict:
        return self.detect_uc.execute(payload)

    def list_prediction_captures(self) -> list[dict]:
        return self.list_prediction_captures_uc.execute()

    def start_prediction(self, payload: dict) -> dict:
        return self.start_prediction_job_uc.execute(payload)

    def prediction_status(self, job_id: str | None = None) -> dict:
        return self.prediction_status_uc.execute(job_id=job_id)
