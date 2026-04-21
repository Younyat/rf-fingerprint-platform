from app.application.use_cases.inference.classify_capture_use_case import ClassifyCaptureUseCase
from app.application.use_cases.inference.detect_unknown_device_use_case import DetectUnknownDeviceUseCase
from app.application.use_cases.inference.verify_capture_use_case import VerifyCaptureUseCase


class InferenceController:
    def __init__(self, classify_uc: ClassifyCaptureUseCase, verify_uc: VerifyCaptureUseCase, detect_uc: DetectUnknownDeviceUseCase) -> None:
        self.classify_uc = classify_uc
        self.verify_uc = verify_uc
        self.detect_uc = detect_uc

    def classify(self, payload: dict) -> dict:
        return self.classify_uc.execute(payload)

    def verify(self, payload: dict) -> dict:
        return self.verify_uc.execute(payload)

    def detect_unknown(self, payload: dict) -> dict:
        return self.detect_uc.execute(payload)
