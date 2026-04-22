import subprocess
import threading
import uuid
from collections import deque
from datetime import datetime, timezone
from typing import Any


class TrainingJobManager:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._jobs: dict[str, dict[str, Any]] = {}
        self._latest_job_id: str | None = None
        self._latest_job_by_type: dict[str, str] = {}

    def start_job(self, command: list[str], cwd: str | None = None, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
        proc = subprocess.Popen(
            command,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=False,
            bufsize=0,
        )

        job_id = str(uuid.uuid4())
        job = {
            "job_id": job_id,
            "command": command,
            "cwd": cwd,
            "metadata": metadata or {},
            "started_at_utc": datetime.now(timezone.utc).isoformat(),
            "ended_at_utc": None,
            "returncode": None,
            "stdout_lines": deque(maxlen=4000),
            "stderr_lines": deque(maxlen=4000),
            "process": proc,
        }

        with self._lock:
            self._jobs[job_id] = job
            self._latest_job_id = job_id
            job_type = str((metadata or {}).get("job_type", "")).strip().lower()
            if job_type:
                self._latest_job_by_type[job_type] = job_id

        self._start_reader_thread(job_id, stream_name="stdout")
        self._start_reader_thread(job_id, stream_name="stderr")

        return {
            "job_id": job_id,
            "status": "running",
            "started_at_utc": job["started_at_utc"],
            "command": command,
            "cwd": cwd,
        }

    def _start_reader_thread(self, job_id: str, stream_name: str) -> None:
        t = threading.Thread(target=self._reader_loop, args=(job_id, stream_name), daemon=True)
        t.start()

    def _reader_loop(self, job_id: str, stream_name: str) -> None:
        stream_attr = "stdout" if stream_name == "stdout" else "stderr"
        lines_attr = "stdout_lines" if stream_name == "stdout" else "stderr_lines"

        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return
            process = job["process"]
            stream = getattr(process, stream_attr)

        if stream is None:
            return

        try:
            for raw_line in iter(stream.readline, b""):
                if not raw_line:
                    break
                try:
                    line = raw_line.decode("utf-8")
                except UnicodeDecodeError:
                    line = raw_line.decode("cp1252", errors="replace")
                with self._lock:
                    job = self._jobs.get(job_id)
                    if job is None:
                        break
                    job[lines_attr].append(line.rstrip("\n"))
        finally:
            try:
                stream.close()
            except Exception:
                pass

    def get_status(self, job_id: str | None = None, job_type: str | None = None) -> dict[str, Any]:
        with self._lock:
            if job_id is None:
                normalized_type = str(job_type or "").strip().lower()
                if normalized_type:
                    job_id = self._latest_job_by_type.get(normalized_type)
                if job_id is None:
                    job_id = self._latest_job_id
            if job_id is None or job_id not in self._jobs:
                return {"status": "not_found", "job_id": job_id}

            job = self._jobs[job_id]
            process = job["process"]
            rc = process.poll()
            if rc is not None and job["returncode"] is None:
                job["returncode"] = rc
                job["ended_at_utc"] = datetime.now(timezone.utc).isoformat()

            status = "running"
            if job["returncode"] is not None:
                status = "completed" if job["returncode"] == 0 else "failed"

            return {
                "status": status,
                "job_id": job_id,
                "started_at_utc": job["started_at_utc"],
                "ended_at_utc": job["ended_at_utc"],
                "returncode": job["returncode"],
                "command": job["command"],
                "cwd": job["cwd"],
                "metadata": job["metadata"],
                "stdout": "\n".join(job["stdout_lines"]),
                "stderr": "\n".join(job["stderr_lines"]),
            }
