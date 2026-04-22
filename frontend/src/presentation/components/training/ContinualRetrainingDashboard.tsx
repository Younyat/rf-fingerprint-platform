import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { TrainingController } from "../../controllers/TrainingController";

const RETRAIN_JOB_KEY = "rfp.retrain.jobId";

function pct(v: number): string {
  return `${(v * 100).toFixed(2)}%`;
}

export function ContinualRetrainingDashboard() {
  const controller = useMemo(() => new TrainingController(), []);
  const pollRef = useRef<number | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [jobId, setJobId] = useState<string>(() => localStorage.getItem(RETRAIN_JOB_KEY) || "");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    remote_user: "assouyat",
    remote_host: "192.168.193.49",
    remote_venv_activate: "/home/assouyat/rfenv/bin/activate",
    epochs: 10,
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

  const loadDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const d = await controller.dashboard(form.local_output_dir);
      setDashboard(d);
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setLoadingDashboard(false);
    }
  };

  const pollStatus = async (id?: string) => {
    try {
      const st = await controller.status(id);
      setJobStatus(st);
      if (st?.job_id) {
        setJobId(st.job_id);
        localStorage.setItem(RETRAIN_JOB_KEY, st.job_id);
      }
      if (st.status === "completed" || st.status === "failed") {
        stopPolling();
        await loadDashboard();
      }
    } catch (err: unknown) {
      setError(String(err));
      stopPolling();
    }
  };

  const startPolling = (id?: string) => {
    stopPolling();
    void pollStatus(id);
    pollRef.current = window.setInterval(() => {
      void pollStatus(id || jobId || undefined);
    }, 2000);
  };

  useEffect(() => {
    void loadDashboard();
    if (jobId) {
      startPolling(jobId);
    }
    return () => stopPolling();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStarting(true);
    setError("");
    try {
      const res = await controller.retrain(form);
      if (res?.job_id) {
        setJobId(res.job_id);
        localStorage.setItem(RETRAIN_JOB_KEY, res.job_id);
        startPolling(res.job_id);
      }
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setStarting(false);
    }
  };

  const isRunning = starting || String(jobStatus?.status || "").toLowerCase() === "running";
  const kpi = dashboard?.kpi || {};
  const versions: any[] = Array.isArray(dashboard?.versions) ? dashboard.versions : [];
  const historyTail: any[] = Array.isArray(dashboard?.history_tail) ? dashboard.history_tail : [];

  return (
    <div className="grid">
      <section className="panel validation-hero">
        <div>
          <h3>Continual Retraining Lab</h3>
          <p>Reentrena de forma incremental con versionado automático para preservar historial y trazabilidad.</p>
        </div>
        <div className="validation-hero-badge">Lifelong RF Learning</div>
      </section>

      <section className="panel">
        <div className="validation-capture-header">
          <h4>Dashboard de rigor</h4>
          <button onClick={() => void loadDashboard()} disabled={loadingDashboard}>
            {loadingDashboard ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
        <div className="validation-kpi-grid" style={{ marginTop: 10 }}>
          <div className="validation-kpi"><div className="kpi-label">Devices</div><div className="kpi-value">{kpi.num_devices ?? 0}</div></div>
          <div className="validation-kpi"><div className="kpi-label">Dataset Records</div><div className="kpi-value">{kpi.dataset_records ?? 0}</div></div>
          <div className="validation-kpi"><div className="kpi-label">Model Versions</div><div className="kpi-value">{kpi.total_versions ?? 0}</div></div>
          <div className="validation-kpi"><div className="kpi-label">Best Test Acc</div><div className="kpi-value">{pct(Number(kpi.best_test_acc ?? 0))}</div></div>
          <div className="validation-kpi"><div className="kpi-label">Last Test Acc</div><div className="kpi-value">{pct(Number(kpi.last_test_acc ?? 0))}</div></div>
          <div className="validation-kpi"><div className="kpi-label">History Epochs</div><div className="kpi-value">{kpi.history_epochs ?? 0}</div></div>
        </div>
      </section>

      <section className="panel">
        <h4>Lanzar reentrenamiento</h4>
        <form onSubmit={submit} className="grid">
          <div className="grid grid-2">
            <input value={form.remote_user} onChange={(e) => setForm({ ...form, remote_user: e.target.value })} placeholder="remote_user" />
            <input value={form.remote_host} onChange={(e) => setForm({ ...form, remote_host: e.target.value })} placeholder="remote_host" />
            <input value={form.remote_venv_activate} onChange={(e) => setForm({ ...form, remote_venv_activate: e.target.value })} placeholder="remote_venv_activate" />
            <input value={form.local_dataset_dir} onChange={(e) => setForm({ ...form, local_dataset_dir: e.target.value })} placeholder="local_dataset_dir" />
            <input value={form.local_output_dir} onChange={(e) => setForm({ ...form, local_output_dir: e.target.value })} placeholder="local_output_dir" />
            <input type="number" value={form.epochs} onChange={(e) => setForm({ ...form, epochs: Number(e.target.value) })} placeholder="epochs" />
            <input type="number" value={form.batch_size} onChange={(e) => setForm({ ...form, batch_size: Number(e.target.value) })} placeholder="batch_size" />
            <input type="number" value={form.window_size} onChange={(e) => setForm({ ...form, window_size: Number(e.target.value) })} placeholder="window_size" />
            <input type="number" value={form.stride} onChange={(e) => setForm({ ...form, stride: Number(e.target.value) })} placeholder="stride" />
          </div>
          <button type="submit" disabled={isRunning}>
            {isRunning ? `Reentrenamiento en curso... ${jobStatus?.job_id || jobId || ""}`.trim() : "Reentrenar preservando historial"}
          </button>
        </form>
      </section>

      <section className="panel">
        <h4>Estado del job</h4>
        <div><strong>Status:</strong> {jobStatus?.status || "-"}</div>
        <div><strong>Job ID:</strong> {jobStatus?.job_id || jobId || "-"}</div>
        <div><strong>Return code:</strong> {String(jobStatus?.returncode ?? "-")}</div>
        <div className="grid grid-2" style={{ marginTop: 8 }}>
          <div>
            <h5>STDOUT</h5>
            <pre className="log-box">{jobStatus?.stdout || ""}</pre>
          </div>
          <div>
            <h5>STDERR</h5>
            <pre className="log-box error-log">{jobStatus?.stderr || ""}</pre>
          </div>
        </div>
      </section>

      <section className="panel">
        <h4>Historial de versiones</h4>
        <div className="validation-table-wrap">
          <table className="validation-table">
            <thead>
              <tr>
                <th>Version ID</th>
                <th>Reason</th>
                <th>Created (UTC)</th>
                <th>Snapshot Dir</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v: any) => (
                <tr key={String(v.version_id)}>
                  <td>{String(v.version_id)}</td>
                  <td>{String(v.reason)}</td>
                  <td>{String(v.created_at_utc)}</td>
                  <td className="small-path">{String(v.snapshot_dir)}</td>
                </tr>
              ))}
              {versions.length === 0 && (
                <tr>
                  <td colSpan={4}>No hay snapshots todavía.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h4>Evolución reciente (tail)</h4>
        <div className="validation-table-wrap">
          <table className="validation-table">
            <thead>
              <tr>
                <th>Epoch</th>
                <th>Train Acc</th>
                <th>Test Acc</th>
                <th>Train Loss</th>
                <th>Test Loss</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {historyTail.map((r: any, idx: number) => (
                <tr key={`${String(r.epoch)}-${idx}`}>
                  <td>{String(r.epoch)}</td>
                  <td>{pct(Number(r.train_acc || 0))}</td>
                  <td>{pct(Number(r.test_acc || 0))}</td>
                  <td>{Number(r.train_loss || 0).toFixed(6)}</td>
                  <td>{Number(r.test_loss || 0).toFixed(6)}</td>
                  <td>{String(r.mode || "")}</td>
                </tr>
              ))}
              {historyTail.length === 0 && (
                <tr>
                  <td colSpan={6}>No hay historial de entrenamiento.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {error && <pre style={{ color: "#b42318", whiteSpace: "pre-wrap" }}>{error}</pre>}
    </div>
  );
}
