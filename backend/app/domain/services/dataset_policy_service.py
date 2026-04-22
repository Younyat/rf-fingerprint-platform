from collections import Counter
import json
from pathlib import Path


class DatasetPolicyService:
    def evaluate(self, records: list[dict]) -> dict:
        emitters = Counter(r["emitter_device_id"] for r in records if r.get("emitter_device_id"))
        center_freqs = Counter()
        sample_rates = Counter()

        for r in records:
            cf = r.get("center_frequency_hz")
            sr = r.get("sample_rate_hz")

            # Dataset records may only include metadata path. Read RF params from metadata when needed.
            if (cf is None or sr is None) and r.get("metadata_path"):
                try:
                    meta = json.loads(Path(r["metadata_path"]).read_text(encoding="utf-8"))
                    if cf is None:
                        cf = meta.get("center_frequency_hz")
                    if sr is None:
                        sr = meta.get("sample_rate_hz")
                except Exception:
                    pass

            if cf is not None:
                center_freqs[round(float(cf), 3)] += 1
            if sr is not None:
                sample_rates[round(float(sr), 6)] += 1

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
