import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { DatasetController } from "../../controllers/DatasetController";
export function DatasetRecordsManager({ onChanged }) {
    const controller = new DatasetController();
    const [records, setRecords] = useState([]);
    const [selected, setSelected] = useState({});
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const [train, val] = await Promise.all([controller.train(), controller.val()]);
            setRecords([...(train || []), ...(val || [])]);
        }
        catch (err) {
            setError(String(err));
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, []);
    const selectedRecords = useMemo(() => records.filter((r) => selected[r.metadata_path]), [records, selected]);
    const toggle = (metadataPath) => {
        setSelected((prev) => ({ ...prev, [metadataPath]: !prev[metadataPath] }));
    };
    const toggleAll = (checked) => {
        if (!checked) {
            setSelected({});
            return;
        }
        const next = {};
        for (const r of records)
            next[r.metadata_path] = true;
        setSelected(next);
    };
    const deleteSelected = async () => {
        if (selectedRecords.length === 0)
            return;
        const ok = window.confirm(`Eliminar definitivamente ${selectedRecords.length} registros y sus archivos (.json/.cfile)?`);
        if (!ok)
            return;
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
        }
        catch (err) {
            setError(String(err));
        }
        finally {
            setDeleting(false);
        }
    };
    return (_jsxs("div", { className: "panel", children: [_jsx("h3", { children: "Dataset Records" }), _jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 8 }, children: [_jsx("button", { onClick: () => load(), disabled: loading, children: "Recargar" }), _jsx("button", { onClick: () => toggleAll(true), disabled: records.length === 0, children: "Seleccionar todo" }), _jsx("button", { onClick: () => toggleAll(false), disabled: Object.keys(selected).length === 0, children: "Limpiar selecci\u00F3n" }), _jsx("button", { onClick: deleteSelected, disabled: deleting || selectedRecords.length === 0, style: { background: "#b42318", color: "white" }, children: deleting ? "Eliminando..." : `Eliminar seleccionados (${selectedRecords.length})` })] }), error && _jsx("pre", { style: { color: "#b42318", whiteSpace: "pre-wrap" }, children: error }), result && _jsx("pre", { style: { whiteSpace: "pre-wrap" }, children: JSON.stringify(result, null, 2) }), _jsx("div", { style: { maxHeight: 360, overflow: "auto", border: "1px solid #dbe1ea", borderRadius: 8 }, children: _jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { textAlign: "left", padding: 8 }, children: "Sel" }), _jsx("th", { style: { textAlign: "left", padding: 8 }, children: "split" }), _jsx("th", { style: { textAlign: "left", padding: 8 }, children: "device" }), _jsx("th", { style: { textAlign: "left", padding: 8 }, children: "session" }), _jsx("th", { style: { textAlign: "left", padding: 8 }, children: "metadata" })] }) }), _jsxs("tbody", { children: [records.map((r) => (_jsxs("tr", { children: [_jsx("td", { style: { padding: 8 }, children: _jsx("input", { type: "checkbox", checked: !!selected[r.metadata_path], onChange: () => toggle(r.metadata_path) }) }), _jsx("td", { style: { padding: 8 }, children: r.split }), _jsx("td", { style: { padding: 8 }, children: r.emitter_device_id }), _jsx("td", { style: { padding: 8 }, children: r.session_id }), _jsx("td", { style: { padding: 8, fontSize: 12 }, children: r.metadata_path })] }, r.metadata_path))), records.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 5, style: { padding: 12 }, children: "No hay registros en dataset." }) }))] })] }) })] }));
}
