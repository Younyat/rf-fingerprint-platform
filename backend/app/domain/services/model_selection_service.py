class ModelSelectionService:
    def pick_current(self, models: list[dict]) -> dict | None:
        if not models:
            return None
        return sorted(models, key=lambda x: x.get("created_at_utc", ""), reverse=True)[0]
