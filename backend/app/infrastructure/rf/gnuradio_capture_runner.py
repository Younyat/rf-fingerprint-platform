from datetime import datetime, timezone
from pathlib import Path


class GnuRadioCaptureRunner:
    def run_capture(self, output_cfile: Path, duration_seconds: float) -> dict:
        # Placeholder control point. Replace with real GNU Radio integration from existing script.
        output_cfile.parent.mkdir(parents=True, exist_ok=True)
        if not output_cfile.exists():
            output_cfile.write_bytes(b"")
        return {
            "capture_id": datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ"),
            "output_cfile": str(output_cfile),
            "duration_seconds": duration_seconds,
        }
