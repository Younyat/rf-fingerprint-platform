import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { TrainingController } from "../../controllers/TrainingController";

export function TrainingConfigForm() {
  const controller = useMemo(() => new TrainingController(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startResult, setStartResult] = useState<any>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [jobId, setJobId] = useState<string>("");
  const pollRef = useRef<number | null>(null);

  const [form, setForm] = useState({
    remote_user: "assouyat",
    remote_host: "192.168.193.49",
    remote_venv_activate: "/home/assouyat/rfenv/bin/activate",
    epochs: 20,
    batch_size: 128,
    window_size: 1024,
    stride: 1024,
    local_dataset_dir: "rf_dataset",
    local_output_dir: "remote_trained_model",
  });

  const stopPolling = () => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const pollStatus = async (id: string) => {
    try {
      const status = await controller.status(id);
      setJobStatus(status);
      if (status.status === "completed" || status.status === "failed") {
        stopPolling();
      }
    } catch (err: any) {
      setError(String(err));
      stopPolling();
    }
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
        await pollStatus(res.job_id);
        pollRef.current = window.setInterval(() => {
          void pollStatus(res.job_id);
        }, 2000);
      }
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => () => stopPolling(), []);

  return (
    <div className="panel">
      <h3>Remote Training</h3>
      <form onSubmit={submit} className="grid">
        <input value={form.remote_user} onChange={(e) => setForm({ ...form, remote_user: e.target.value })} placeholder="remote user" />
        <input value={form.remote_host} onChange={(e) => setForm({ ...form, remote_host: e.target.value })} placeholder="remote host" />
        <input value={form.remote_venv_activate} onChange={(e) => setForm({ ...form, remote_venv_activate: e.target.value })} placeholder="venv activate path" />
        <input value={form.local_dataset_dir} onChange={(e) => setForm({ ...form, local_dataset_dir: e.target.value })} placeholder="dataset dir" />
        <input value={form.local_output_dir} onChange={(e) => setForm({ ...form, local_output_dir: e.target.value })} placeholder="output dir" />
        <input type="number" value={form.epochs} onChange={(e) => setForm({ ...form, epochs: Number(e.target.value) })} placeholder="epochs" />
        <button disabled={loading} type="submit">{loading ? "Lanzando..." : "Lanzar training remoto"}</button>
      </form>

      {error && <pre style={{ color: "#b42318", whiteSpace: "pre-wrap" }}>{error}</pre>}

      {startResult && (
        <div style={{ marginTop: 12 }}>
          <strong>Job ID:</strong> {jobId}
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(startResult, null, 2)}</pre>
        </div>
      )}

      {jobStatus && (
        <div style={{ marginTop: 12 }}>
          <h4>Estado: {jobStatus.status}</h4>
          <div><strong>Return code:</strong> {String(jobStatus.returncode)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            <div>
              <h5>STDOUT</h5>
              <pre style={{ whiteSpace: "pre-wrap", maxHeight: 320, overflow: "auto", background: "#f8fafc", padding: 8 }}>{jobStatus.stdout || ""}</pre>
            </div>
            <div>
              <h5>STDERR</h5>
              <pre style={{ whiteSpace: "pre-wrap", maxHeight: 320, overflow: "auto", background: "#fff1f2", padding: 8 }}>{jobStatus.stderr || ""}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
