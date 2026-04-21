class ThresholdPolicyService:
    def threshold_from_profile(self, mean_distance: float, std_distance: float, sigma: float = 3.0) -> float:
        return float(mean_distance + sigma * max(std_distance, 1e-6))
