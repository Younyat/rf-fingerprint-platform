import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { DatasetController } from "../../controllers/DatasetController";
import { ValidationController } from "../../controllers/ValidationController";
import { PerDeviceValidationTable } from "./PerDeviceValidationTable";
import { ValidationSummaryCard } from "./ValidationSummaryCard";
import { ValidationRunResponse, buildScientificSummary } from "./types";

const VALIDATION_JOB_KEY = "rfp.validation.jobId";
const VALIDATION_SELECTED_KEY = "rfp.validation.selectedMetadataPaths";

interface ValDatasetRecord {
  split: string;
  emitter_device_id: string;
  session_id: string;
  cfile_path: string;
  metadata_path: string;
}

export function ValidationRunForm() {
  const validationController = useMemo(() => new ValidationController(), []);
  const datasetController = useMemo(() => new DatasetController(), []);
  const pollRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState("");
  const [startResult, setStartResult] = useState<any>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [records, setRecords] = useState<ValDatasetRecord[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(VALIDATION_SELECTED_KEY);
      if (!raw) return {};
      const arr = JSON.parse(raw) as string[];
      if (!Array.isArray(arr)) return {};
      const out: Record<string, boolean> = {};
      for (const p of arr) out[String(p)] = true;
      return out;
    } catch {
      return {};
    }
  });
  const [filter, setFilter] = useState("");
  const [showRawOutput, setShowRawOutput] = useState(false);
  const [jobId, setJobId] = useState<string>(() => localStorage.getItem(VALIDATION_JOB_KEY) || "");

  const [form, setForm] = useState({
    val_root: "rf_dataset_val",
    model_dir: "remote_trained_model",
    output_json: "validation/validation_report.json",
    batch_size: 256,
    python_exe: "C:/Users/Usuario/radioconda/python.exe",
  });

  const stopPolling = () => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const loadValRecords = async () => {
    setLoadingRecords(true);
    setError("");
    try {
      const val = (await datasetController.val()) as ValDatasetRecord[];
      setRecords(val || []);
      if (Object.keys(selected).length === 0) {
        const next: Record<string, boolean> = {};
        for (const rec of val || []) next[rec.metadata_path] = true;
        setSelected(next);
      }
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    void loadValRecords();
  }, []);

  useEffect(() => {
    const selectedPaths = Object.keys(selected).filter((k) => selected[k]);
    localStorage.setItem(VALIDATION_SELECTED_KEY, JSON.stringify(selectedPaths));
  }, [selected]);

  const normalizedFilter = filter.trim().toLowerCase();
  const filtered = records.filter((r) => {
    if (!normalizedFilter) return true;
    const raw = `${r.emitter_device_id} ${r.session_id} ${r.metadata_path}`.toLowerCase();
    return raw.includes(normalizedFilter);
  });

  const selectedMetadataPaths = filtered.filter((r) => selected[r.metadata_path]).map((r) => r.metadata_path);
  const selectedTotal = Object.values(selected).filter(Boolean).length;

  const selectAllFiltered = (checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev };
      for (const row of filtered) next[row.metadata_path] = checked;
      return next;
    });
  };

  const pollStatus = async (id?: string) => {
    try {
      const status = await validationController.status(id);
      setJobStatus(status);
      if (status?.job_id) {
        setJobId(status.job_id);
        localStorage.setItem(VALIDATION_JOB_KEY, status.job_id);
      }
      if (status.status === "completed" || status.status === "failed") {
        stopPolling();
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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStartResult(null);
    setJobStatus(null);
    stopPolling();
    try {
      const payload = {
        ...form,
        selected_metadata_paths: selectedMetadataPaths,
      };
      const res = await validationController.start(payload);
      setStartResult(res);
      if (res?.job_id) {
        setJobId(res.job_id);
        localStorage.setItem(VALIDATION_JOB_KEY, res.job_id);
        startPolling(res.job_id);
      }
    } catch (err: unknown) {
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

  const report = (jobStatus?.report || null) as ValidationRunResponse["report"] | null;
  const summary = report ? buildScientificSummary(report) : null;
  const effectiveStatus = (jobStatus?.status || startResult?.status || "").toLowerCase();
  const isValidationRunning = loading || effectiveStatus === "running";

  return (
    <div className="grid">
      <section className="panel validation-hero">
        <div>
          <h3>Validation Lab</h3>
          <p>Selecciona capturas del dataset `val`, ejecuta verificación y revisa métricas científicas por emisor.</p>
        </div>
        <div className="validation-hero-badge">Scientific QA</div>
      </section>

      <section className="panel">
        <h4>Configuración de validación</h4>
        <form onSubmit={submit} className="grid">
          <div className="grid grid-2">
            <input value={form.val_root} onChange={(e) => setForm({ ...form, val_root: e.target.value })} placeholder="val_root" />
            <input value={form.model_dir} onChange={(e) => setForm({ ...form, model_dir: e.target.value })} placeholder="model_dir" />
            <input value={form.output_json} onChange={(e) => setForm({ ...form, output_json: e.target.value })} placeholder="output_json" />
            <input value={form.python_exe} onChange={(e) => setForm({ ...form, python_exe: e.target.value })} placeholder="python_exe" />
            <input
              type="number"
              value={form.batch_size}
              onChange={(e) => setForm({ ...form, batch_size: Number(e.target.value) })}
              placeholder="batch_size"
            />
          </div>

          <div className="validation-capture-header">
            <h4>Capturas de validación (split=val)</h4>
            <div className="validation-capture-actions">
              <button type="button" onClick={() => void loadValRecords()} disabled={loadingRecords}>
                {loadingRecords ? "Recargando..." : "Recargar"}
              </button>
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrar por device/session/path" />
              <button type="button" onClick={() => selectAllFiltered(true)} disabled={filtered.length === 0}>Seleccionar visibles</button>
              <button type="button" onClick={() => selectAllFiltered(false)} disabled={filtered.length === 0}>Limpiar visibles</button>
            </div>
          </div>

          <div className="validation-selection-info">
            {selectedTotal} seleccionadas de {records.length} | {filtered.length} visibles
          </div>

          <div className="validation-table-wrap">
            <table className="validation-table">
              <thead>
                <tr>
                  <th>Sel</th>
                  <th>Device</th>
                  <th>Session</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.metadata_path}>
                    <td>
                      <input type="checkbox" checked={!!selected[r.metadata_path]} onChange={(e) => setSelected((prev) => ({ ...prev, [r.metadata_path]: e.target.checked }))} />
                    </td>
                    <td>{r.emitter_device_id}</td>
                    <td>{r.session_id}</td>
                    <td className="small-path">{r.metadata_path}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4}>No hay capturas val disponibles con el filtro actual.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button disabled={isValidationRunning || selectedMetadataPaths.length === 0} type="submit">
            {isValidationRunning
              ? `Validando en curso... ${jobStatus?.job_id || startResult?.job_id || jobId || ""}`.trim()
              : `Ejecutar validación sobre ${selectedMetadataPaths.length} capturas`}
          </button>
        </form>
      </section>

      {error && <pre style={{ color: "#b42318", whiteSpace: "pre-wrap" }}>{error}</pre>}
      {summary && <ValidationSummaryCard summary={summary} />}
      {summary && <PerDeviceValidationTable rows={summary.perDevice} />}

      {(startResult || jobStatus) && (
        <section className="panel">
          <div className="validation-capture-header">
            <h4>Estado del job de validación</h4>
            <button type="button" onClick={() => setShowRawOutput((s) => !s)}>
              {showRawOutput ? "Ocultar salida cruda" : "Mostrar salida cruda"}
            </button>
          </div>
          <div><strong>Job ID:</strong> {jobStatus?.job_id || startResult?.job_id || jobId || "-"}</div>
          <div><strong>Status:</strong> {jobStatus?.status || startResult?.status || "-"}</div>
          <div><strong>Return code:</strong> {String(jobStatus?.returncode)}</div>
          <div><strong>Output JSON:</strong> {(jobStatus?.metadata?.output_json || "-")}</div>

          {showRawOutput && (
            <div className="grid grid-2" style={{ marginTop: 12 }}>
              <div>
                <h5>STDOUT</h5>
                <pre className="log-box">{jobStatus?.stdout || ""}</pre>
              </div>
              <div>
                <h5>STDERR</h5>
                <pre className="log-box error-log">{jobStatus?.stderr || ""}</pre>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
