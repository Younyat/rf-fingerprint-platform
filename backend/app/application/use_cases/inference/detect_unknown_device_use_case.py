class DetectUnknownDeviceUseCase:
    def execute(self, payload: dict) -> dict:
        return {"status": "pending", "is_unknown": True, "input": payload}

