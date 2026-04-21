from collections import Counter


class DatasetPolicyService:
    def evaluate(self, records: list[dict]) -> dict:
        emitters = Counter(r["emitter_device_id"] for r in records if r.get("emitter_device_id"))
        center_freqs = Counter(round(float(r.get("center_frequency_hz", 0.0)), 3) for r in records if r.get("center_frequency_hz") is not None)
        sample_rates = Counter(round(float(r.get("sample_rate_hz", 0.0)), 6) for r in records if r.get("sample_rate_hz") is not None)

        warnings: list[str] = []
        if len(emitters) < 2:
            warnings.append("Less than 2 emitter_device_id values")
        if len(center_freqs) > 1:
            warnings.append("Mixed center frequencies detected")
        if len(sample_rates) > 1:
            warnings.append("Mixed sample rates detected")

        return {
            "emitters": dict(emitters),
            "center_frequencies": dict(center_freqs),
            "sample_rates": dict(sample_rates),
            "warnings": warnings,
            "is_valid_for_multiclass": len(warnings) == 0,
        }
