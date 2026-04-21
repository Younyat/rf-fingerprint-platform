class SplitPolicyService:
    def detect_leakage(self, train_records: list[dict], val_records: list[dict]) -> list[str]:
        train_sessions = {(r.get("emitter_device_id"), r.get("session_id")) for r in train_records}
        val_sessions = {(r.get("emitter_device_id"), r.get("session_id")) for r in val_records}
        overlap = sorted(train_sessions.intersection(val_sessions))
        return [f"Leakage detected for emitter/session: {e}/{s}" for e, s in overlap]
