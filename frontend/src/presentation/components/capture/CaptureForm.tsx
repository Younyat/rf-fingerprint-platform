import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CaptureController } from "../../controllers/CaptureController";

const CAPTURE_JOB_KEY = "rfp.capture.jobId";

interface CaptureFormProps {
  onCreated?: () => void;
}

export function CaptureForm({ onCreated }: CaptureFormProps) {
  const controller = useMemo(() => new CaptureController(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startResult, setStartResult] = useState<any>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [jobId, setJobId] = useState<string>(() => localStorage.getItem(CAPTURE_JOB_KEY) || "");
  const pollRef = useRef<number | null>(null);

  const [form, setForm] = useState({
    emitter_device_id: "remote_001",
    session_id: "session_001",
    receiver_id: "usrp_b200_01",
    environment_id: "lab_a",
    frequency_mhz: 89.4,
    sample_rate_hz: 10000000,
    duration_seconds: 5,
    gain_db: 20,
    split: "train",
    python_exe: "C:/Users/Usuario/radioconda/python.exe",
  });

  const stopPolling = () => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const pollStatus = async (id?: string) => {
    try {
      const status = await controller.status(id);
      setJobStatus(status);
      if (status?.job_id) {
        setJobId(status.job_id);
        localStorage.setItem(CAPTURE_JOB_KEY, status.job_id);
      }
      if (status.status === "completed" || status.status === "failed") {
        stopPolling();
        if (status.status === "completed") {
          onCreated?.();
        }
      }
    } catch (err: any) {
      setError(String(err));
      stopPolling();
    }
  };

  const startPolling = (id?: string) => {
    stopPolling();
    void pollStatus(id);
    pollRef.current = window.setInterval(() => {
      void pollStatus(id || jobId || undefined);
    }, 1500);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStartResult(null);
    setJobStatus(null);
    stopPolling();
    try {
      const res = await controller.start(form);
      setStartResult(res);
      if (res?.job_id) {
        setJobId(res.job_id);
        localStorage.setItem(CAPTURE_JOB_KEY, res.job_id);
        startPolling(res.job_id);
      }
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      startPolling(jobId);
      return () => stopPolling();
    }
    void pollStatus(undefined);
    return () => stopPolling();
  }, []);

  const effectiveStatus = String(jobStatus?.status || startResult?.status || "").toLowerCase();
  const isCaptureRunning = loading || effectiveStatus === "running";

  return (
    <div className="panel">
      <h3>Capture RF</h3>
      <form onSubmit={submit} className="grid">
        <input value={form.emitter_device_id} onChange={(e) => setForm({ ...form, emitter_device_id: e.target.value })} placeholder="emitter_device_id" />
        <input value={form.session_id} onChange={(e) => setForm({ ...form, session_id: e.target.value })} placeholder="session_id" />
        <input value={form.frequency_mhz} type="number" step="0.000001" onChange={(e) => setForm({ ...form, frequency_mhz: Number(e.target.value) })} placeholder="frequency MHz" />
        <input value={form.sample_rate_hz} type="number" onChange={(e) => setForm({ ...form, sample_rate_hz: Number(e.target.value) })} placeholder="sample_rate_hz" />
        <input value={form.duration_seconds} type="number" step="0.1" onChange={(e) => setForm({ ...form, duration_seconds: Number(e.target.value) })} placeholder="duration_seconds" />
        <input value={form.gain_db} type="number" step="0.1" onChange={(e) => setForm({ ...form, gain_db: Number(e.target.value) })} placeholder="gain_db" />
        <select value={form.split} onChange={(e) => setForm({ ...form, split: e.target.value })}>
          <option value="train">train</option>
          <option value="val">val</option>
          <option value="predict">predict</option>
        </select>
        <input value={form.python_exe} onChange={(e) => setForm({ ...form, python_exe: e.target.value })} placeholder="python executable" />
        <button disabled={isCaptureRunning} type="submit">
          {isCaptureRunning
            ? `Captura en curso... ${jobStatus?.job_id || startResult?.job_id || jobId || ""}`.trim()
            : "Capturar"}
        </button>
      </form>

      {error && <pre style={{ color: "#b42318", whiteSpace: "pre-wrap" }}>{error}</pre>}
      {startResult && <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(startResult, null, 2)}</pre>}
      {jobStatus && (
        <div style={{ marginTop: 10 }}>
          <div><strong>Estado:</strong> {jobStatus.status}</div>
          <div><strong>Job ID:</strong> {jobStatus.job_id || jobId || "-"}</div>
          <pre className="log-box">{jobStatus.stdout || ""}</pre>
          {!!jobStatus.stderr && <pre className="log-box error-log">{jobStatus.stderr}</pre>}
        </div>
      )}
    </div>
  );
}
