class SummarizeValidationUseCase:
    def execute(self, report: dict) -> dict:
        return {
            "accuracy": report.get("accuracy"),
            "macro_f1": report.get("macro_f1"),
            "notes": report.get("notes", []),
        }
