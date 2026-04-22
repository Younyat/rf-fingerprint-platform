import { FormEvent, useEffect, useMemo, useState } from "react";
import { DatasetController } from "../../controllers/DatasetController";
import { ValidationController } from "../../controllers/ValidationController";
import { PerDeviceValidationTable } from "./PerDeviceValidationTable";
import { ValidationSummaryCard } from "./ValidationSummaryCard";
import { ValidationRunResponse, buildScientificSummary } from "./types";

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

  const [loading, setLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ValidationRunResponse | null>(null);
  const [records, setRecords] = useState<ValDatasetRecord[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");
  const [showRawOutput, setShowRawOutput] = useState(false);

  const [form, setForm] = useState({
    val_root: "rf_dataset_val",
    model_dir: "remote_trained_model",
    output_json: "validation/validation_report.json",
    batch_size: 256,
    python_exe: "C:/Users/Usuario/radioconda/python.exe",
  });

  const loadValRecords = async () => {
    setLoadingRecords(true);
    setError("");
    try {
      const val = (await datasetController.val()) as ValDatasetRecord[];
      setRecords(val || []);
      const next: Record<string, boolean> = {};
      for (const rec of val || []) next[rec.metadata_path] = true;
      setSelected(next);
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    void loadValRecords();
  }, []);

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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const payload = {
        ...form,
        selected_metadata_paths: selectedMetadataPaths,
      };
      const res = (await validationController.run(payload)) as ValidationRunResponse;
      setResult(res);
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const summary = result?.report ? buildScientificSummary(result.report) : null;

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
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filtrar por device/session/path"
              />
              <button type="button" onClick={() => selectAllFiltered(true)} disabled={filtered.length === 0}>
                Seleccionar visibles
              </button>
              <button type="button" onClick={() => selectAllFiltered(false)} disabled={filtered.length === 0}>
                Limpiar visibles
              </button>
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
                      <input
                        type="checkbox"
                        checked={!!selected[r.metadata_path]}
                        onChange={(e) => setSelected((prev) => ({ ...prev, [r.metadata_path]: e.target.checked }))}
                      />
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

          <button disabled={loading || selectedMetadataPaths.length === 0} type="submit">
            {loading ? "Validando..." : `Ejecutar validación sobre ${selectedMetadataPaths.length} capturas`}
          </button>
        </form>
      </section>

      {error && <pre style={{ color: "#b42318", whiteSpace: "pre-wrap" }}>{error}</pre>}

      {summary && <ValidationSummaryCard summary={summary} />}
      {summary && <PerDeviceValidationTable rows={summary.perDevice} />}

      {result && (
        <section className="panel">
          <div className="validation-capture-header">
            <h4>Resultado del job</h4>
            <button type="button" onClick={() => setShowRawOutput((s) => !s)}>
              {showRawOutput ? "Ocultar salida cruda" : "Mostrar salida cruda"}
            </button>
          </div>
          <div>Return code: {result.command_result.returncode}</div>
          <div>Output JSON: {result.output_json}</div>
          <div>Capturas seleccionadas: {result.selected_count}</div>

          {showRawOutput && (
            <div className="grid grid-2" style={{ marginTop: 12 }}>
              <div>
                <h5>STDOUT</h5>
                <pre className="log-box">{result.command_result.stdout || ""}</pre>
              </div>
              <div>
                <h5>STDERR</h5>
                <pre className="log-box error-log">{result.command_result.stderr || ""}</pre>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
