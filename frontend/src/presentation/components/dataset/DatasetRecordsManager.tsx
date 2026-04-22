import { useEffect, useMemo, useState } from "react";
import { DatasetController } from "../../controllers/DatasetController";

interface DatasetRecordsManagerProps {
  onChanged?: () => void;
}

export function DatasetRecordsManager({ onChanged }: DatasetRecordsManagerProps) {
  const controller = new DatasetController();
  const [records, setRecords] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [train, val] = await Promise.all([controller.train(), controller.val()]);
      setRecords([...(train || []), ...(val || [])]);
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedRecords = useMemo(
    () => records.filter((r) => selected[r.metadata_path]),
    [records, selected]
  );

  const toggle = (metadataPath: string) => {
    setSelected((prev) => ({ ...prev, [metadataPath]: !prev[metadataPath] }));
  };

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      setSelected({});
      return;
    }
    const next: Record<string, boolean> = {};
    for (const r of records) next[r.metadata_path] = true;
    setSelected(next);
  };

  const deleteSelected = async () => {
    if (selectedRecords.length === 0) return;
    const ok = window.confirm(`Eliminar definitivamente ${selectedRecords.length} registros y sus archivos (.json/.cfile)?`);
    if (!ok) return;

    setDeleting(true);
    setError("");
    setResult(null);
    try {
      const payload = selectedRecords.map((r) => ({
        split: r.split,
        emitter_device_id: r.emitter_device_id,
        session_id: r.session_id,
        metadata_path: r.metadata_path,
        cfile_path: r.cfile_path,
      }));
      const res = await controller.deleteRecords(payload);
      setResult(res);
      setSelected({});
      await load();
      onChanged?.();
    } catch (err: any) {
      setError(String(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="panel">
      <h3>Dataset Records</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={() => load()} disabled={loading}>Recargar</button>
        <button onClick={() => toggleAll(true)} disabled={records.length === 0}>Seleccionar todo</button>
        <button onClick={() => toggleAll(false)} disabled={Object.keys(selected).length === 0}>Limpiar selección</button>
        <button onClick={deleteSelected} disabled={deleting || selectedRecords.length === 0} style={{ background: "#b42318", color: "white" }}>
          {deleting ? "Eliminando..." : `Eliminar seleccionados (${selectedRecords.length})`}
        </button>
      </div>

      {error && <pre style={{ color: "#b42318", whiteSpace: "pre-wrap" }}>{error}</pre>}
      {result && <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>}

      <div style={{ maxHeight: 360, overflow: "auto", border: "1px solid #dbe1ea", borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Sel</th>
              <th style={{ textAlign: "left", padding: 8 }}>split</th>
              <th style={{ textAlign: "left", padding: 8 }}>device</th>
              <th style={{ textAlign: "left", padding: 8 }}>session</th>
              <th style={{ textAlign: "left", padding: 8 }}>metadata</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.metadata_path}>
                <td style={{ padding: 8 }}>
                  <input type="checkbox" checked={!!selected[r.metadata_path]} onChange={() => toggle(r.metadata_path)} />
                </td>
                <td style={{ padding: 8 }}>{r.split}</td>
                <td style={{ padding: 8 }}>{r.emitter_device_id}</td>
                <td style={{ padding: 8 }}>{r.session_id}</td>
                <td style={{ padding: 8, fontSize: 12 }}>{r.metadata_path}</td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 12 }}>No hay registros en dataset.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
