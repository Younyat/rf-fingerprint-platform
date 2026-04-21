class ClassifyCaptureUseCase:
    def execute(self, payload: dict) -> dict:
        return {"status": "pending", "prediction": None, "input": payload}

