class ScientificValidationService:
    def evaluate_dataset_size(self, total_records: int, total_devices: int) -> list[str]:
        warnings: list[str] = []
        if total_devices < 2:
            warnings.append("At least 2 devices are required")
        if total_records < 10:
            warnings.append("Very small dataset; overfitting risk is high")
        return warnings
