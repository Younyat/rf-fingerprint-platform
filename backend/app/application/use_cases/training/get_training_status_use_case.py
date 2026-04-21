class GetTrainingStatusUseCase:
    def execute(self) -> dict:
        return {"status": "delegated", "message": "Use deployment command output and downloaded training_remote.log"}
