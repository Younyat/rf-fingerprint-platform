class VerifyCaptureUseCase:
    def execute(self, payload: dict) -> dict:
        return {"status": "pending", "is_verified": False, "input": payload}

