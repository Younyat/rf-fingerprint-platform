from app.domain.services.dataset_policy_service import DatasetPolicyService


class CheckDatasetQualityUseCase:
    def __init__(self, policy: DatasetPolicyService) -> None:
        self.policy = policy

    def execute(self, records: list[dict]) -> dict:
        return self.policy.evaluate(records)
