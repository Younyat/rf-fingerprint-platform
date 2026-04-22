import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { DatasetController } from "../../controllers/DatasetController";
import { ValidationController } from "../../controllers/ValidationController";
import { PerDeviceValidationTable } from "./PerDeviceValidationTable";
import { ValidationSummaryCard } from "./ValidationSummaryCard";
import { buildScientificSummary } from "./types";
const VALIDATION_JOB_KEY = "rfp.validation.jobId";
const VALIDATION_SELECTED_KEY = "rfp.validation.selectedMetadataPaths";
export function ValidationRunForm() {
    const validationController = useMemo(() => new ValidationController(), []);
    const datasetController = useMemo(() => new DatasetController(), []);
    const pollRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [error, setError] = useState("");
    const [startResult, setStartResult] = useState(null);
    const [jobStatus, setJobStatus] = useState(null);
    const [records, setRecords] = useState([]);
    const [selected, setSelected] = useState(() => {
        try {
            const raw = localStorage.getItem(VALIDATION_SELECTED_KEY);
            if (!raw)
                return {};
            const arr = JSON.parse(raw);
            if (!Array.isArray(arr))
                return {};
            const out = {};
            for (const p of arr)
                out[String(p)] = true;
            return out;
        }
        catch {
            return {};
        }
    });
    const [filter, setFilter] = useState("");
    const [showRawOutput, setShowRawOutput] = useState(false);
    const [jobId, setJobId] = useState(() => localStorage.getItem(VALIDATION_JOB_KEY) || "");
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
            const val = (await datasetController.val());
            setRecords(val || []);
            if (Object.keys(selected).length === 0) {
                const next = {};
                for (const rec of val || [])
                    next[rec.metadata_path] = true;
                setSelected(next);
            }
        }
        catch (err) {
            setError(String(err));
        }
        finally {
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
        if (!normalizedFilter)
            return true;
        const raw = `${r.emitter_device_id} ${r.session_id} ${r.metadata_path}`.toLowerCase();
        return raw.includes(normalizedFilter);
    });
    const selectedMetadataPaths = filtered.filter((r) => selected[r.metadata_path]).map((r) => r.metadata_path);
    const selectedTotal = Object.values(selected).filter(Boolean).length;
    const selectAllFiltered = (checked) => {
        setSelected((prev) => {
            const next = { ...prev };
            for (const row of filtered)
                next[row.metadata_path] = checked;
            return next;
        });
    };
    const pollStatus = async (id) => {
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
        }
        catch (err) {
            setError(String(err));
            stopPolling();
        }
    };
    const startPolling = (id) => {
        stopPolling();
        void pollStatus(id);
        pollRef.current = window.setInterval(() => {
            void pollStatus(id || jobId || undefined);
        }, 2000);
    };
    const submit = async (e) => {
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
        }
        catch (err) {
            setError(String(err));
        }
        finally {
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
    const report = (jobStatus?.report || null);
    const summary = report ? buildScientificSummary(report) : null;
    const effectiveStatus = (jobStatus?.status || startResult?.status || "").toLowerCase();
    const isValidationRunning = loading || effectiveStatus === "running";
    return (_jsxs("div", { className: "grid", children: [_jsxs("section", { className: "panel validation-hero", children: [_jsxs("div", { children: [_jsx("h3", { children: "Validation Lab" }), _jsx("p", { children: "Selecciona capturas del dataset `val`, ejecuta verificaci\u00F3n y revisa m\u00E9tricas cient\u00EDficas por emisor." })] }), _jsx("div", { className: "validation-hero-badge", children: "Scientific QA" })] }), _jsxs("section", { className: "panel", children: [_jsx("h4", { children: "Configuraci\u00F3n de validaci\u00F3n" }), _jsxs("form", { onSubmit: submit, className: "grid", children: [_jsxs("div", { className: "grid grid-2", children: [_jsx("input", { value: form.val_root, onChange: (e) => setForm({ ...form, val_root: e.target.value }), placeholder: "val_root" }), _jsx("input", { value: form.model_dir, onChange: (e) => setForm({ ...form, model_dir: e.target.value }), placeholder: "model_dir" }), _jsx("input", { value: form.output_json, onChange: (e) => setForm({ ...form, output_json: e.target.value }), placeholder: "output_json" }), _jsx("input", { value: form.python_exe, onChange: (e) => setForm({ ...form, python_exe: e.target.value }), placeholder: "python_exe" }), _jsx("input", { type: "number", value: form.batch_size, onChange: (e) => setForm({ ...form, batch_size: Number(e.target.value) }), placeholder: "batch_size" })] }), _jsxs("div", { className: "validation-capture-header", children: [_jsx("h4", { children: "Capturas de validaci\u00F3n (split=val)" }), _jsxs("div", { className: "validation-capture-actions", children: [_jsx("button", { type: "button", onClick: () => void loadValRecords(), disabled: loadingRecords, children: loadingRecords ? "Recargando..." : "Recargar" }), _jsx("input", { value: filter, onChange: (e) => setFilter(e.target.value), placeholder: "Filtrar por device/session/path" }), _jsx("button", { type: "button", onClick: () => selectAllFiltered(true), disabled: filtered.length === 0, children: "Seleccionar visibles" }), _jsx("button", { type: "button", onClick: () => selectAllFiltered(false), disabled: filtered.length === 0, children: "Limpiar visibles" })] })] }), _jsxs("div", { className: "validation-selection-info", children: [selectedTotal, " seleccionadas de ", records.length, " | ", filtered.length, " visibles"] }), _jsx("div", { className: "validation-table-wrap", children: _jsxs("table", { className: "validation-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Sel" }), _jsx("th", { children: "Device" }), _jsx("th", { children: "Session" }), _jsx("th", { children: "Metadata" })] }) }), _jsxs("tbody", { children: [filtered.map((r) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("input", { type: "checkbox", checked: !!selected[r.metadata_path], onChange: (e) => setSelected((prev) => ({ ...prev, [r.metadata_path]: e.target.checked })) }) }), _jsx("td", { children: r.emitter_device_id }), _jsx("td", { children: r.session_id }), _jsx("td", { className: "small-path", children: r.metadata_path })] }, r.metadata_path))), filtered.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, children: "No hay capturas val disponibles con el filtro actual." }) }))] })] }) }), _jsx("button", { disabled: isValidationRunning || selectedMetadataPaths.length === 0, type: "submit", children: isValidationRunning
                                    ? `Validando en curso... ${jobStatus?.job_id || startResult?.job_id || jobId || ""}`.trim()
                                    : `Ejecutar validación sobre ${selectedMetadataPaths.length} capturas` })] })] }), error && _jsx("pre", { style: { color: "#b42318", whiteSpace: "pre-wrap" }, children: error }), summary && _jsx(ValidationSummaryCard, { summary: summary }), summary && _jsx(PerDeviceValidationTable, { rows: summary.perDevice }), (startResult || jobStatus) && (_jsxs("section", { className: "panel", children: [_jsxs("div", { className: "validation-capture-header", children: [_jsx("h4", { children: "Estado del job de validaci\u00F3n" }), _jsx("button", { type: "button", onClick: () => setShowRawOutput((s) => !s), children: showRawOutput ? "Ocultar salida cruda" : "Mostrar salida cruda" })] }), _jsxs("div", { children: [_jsx("strong", { children: "Job ID:" }), " ", jobStatus?.job_id || startResult?.job_id || jobId || "-"] }), _jsxs("div", { children: [_jsx("strong", { children: "Status:" }), " ", jobStatus?.status || startResult?.status || "-"] }), _jsxs("div", { children: [_jsx("strong", { children: "Return code:" }), " ", String(jobStatus?.returncode)] }), _jsxs("div", { children: [_jsx("strong", { children: "Output JSON:" }), " ", (jobStatus?.metadata?.output_json || "-")] }), showRawOutput && (_jsxs("div", { className: "grid grid-2", style: { marginTop: 12 }, children: [_jsxs("div", { children: [_jsx("h5", { children: "STDOUT" }), _jsx("pre", { className: "log-box", children: jobStatus?.stdout || "" })] }), _jsxs("div", { children: [_jsx("h5", { children: "STDERR" }), _jsx("pre", { className: "log-box error-log", children: jobStatus?.stderr || "" })] })] }))] }))] }));
}
