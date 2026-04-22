import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { TrainingController } from "../../controllers/TrainingController";
const RETRAIN_JOB_KEY = "rfp.retrain.jobId";
function pct(v) {
    return `${(v * 100).toFixed(2)}%`;
}
export function ContinualRetrainingDashboard() {
    const controller = useMemo(() => new TrainingController(), []);
    const pollRef = useRef(null);
    const [loadingDashboard, setLoadingDashboard] = useState(false);
    const [dashboard, setDashboard] = useState(null);
    const [jobStatus, setJobStatus] = useState(null);
    const [jobId, setJobId] = useState(() => localStorage.getItem(RETRAIN_JOB_KEY) || "");
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
        }
        catch (err) {
            setError(String(err));
        }
        finally {
            setLoadingDashboard(false);
        }
    };
    const pollStatus = async (id) => {
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
    useEffect(() => {
        void loadDashboard();
        if (jobId) {
            startPolling(jobId);
        }
        return () => stopPolling();
    }, []);
    const submit = async (e) => {
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
        }
        catch (err) {
            setError(String(err));
        }
        finally {
            setStarting(false);
        }
    };
    const isRunning = starting || String(jobStatus?.status || "").toLowerCase() === "running";
    const kpi = dashboard?.kpi || {};
    const versions = Array.isArray(dashboard?.versions) ? dashboard.versions : [];
    const historyTail = Array.isArray(dashboard?.history_tail) ? dashboard.history_tail : [];
    return (_jsxs("div", { className: "grid", children: [_jsxs("section", { className: "panel validation-hero", children: [_jsxs("div", { children: [_jsx("h3", { children: "Continual Retraining Lab" }), _jsx("p", { children: "Reentrena de forma incremental con versionado autom\u00E1tico para preservar historial y trazabilidad." })] }), _jsx("div", { className: "validation-hero-badge", children: "Lifelong RF Learning" })] }), _jsxs("section", { className: "panel", children: [_jsxs("div", { className: "validation-capture-header", children: [_jsx("h4", { children: "Dashboard de rigor" }), _jsx("button", { onClick: () => void loadDashboard(), disabled: loadingDashboard, children: loadingDashboard ? "Actualizando..." : "Actualizar" })] }), _jsxs("div", { className: "validation-kpi-grid", style: { marginTop: 10 }, children: [_jsxs("div", { className: "validation-kpi", children: [_jsx("div", { className: "kpi-label", children: "Devices" }), _jsx("div", { className: "kpi-value", children: kpi.num_devices ?? 0 })] }), _jsxs("div", { className: "validation-kpi", children: [_jsx("div", { className: "kpi-label", children: "Dataset Records" }), _jsx("div", { className: "kpi-value", children: kpi.dataset_records ?? 0 })] }), _jsxs("div", { className: "validation-kpi", children: [_jsx("div", { className: "kpi-label", children: "Model Versions" }), _jsx("div", { className: "kpi-value", children: kpi.total_versions ?? 0 })] }), _jsxs("div", { className: "validation-kpi", children: [_jsx("div", { className: "kpi-label", children: "Best Test Acc" }), _jsx("div", { className: "kpi-value", children: pct(Number(kpi.best_test_acc ?? 0)) })] }), _jsxs("div", { className: "validation-kpi", children: [_jsx("div", { className: "kpi-label", children: "Last Test Acc" }), _jsx("div", { className: "kpi-value", children: pct(Number(kpi.last_test_acc ?? 0)) })] }), _jsxs("div", { className: "validation-kpi", children: [_jsx("div", { className: "kpi-label", children: "History Epochs" }), _jsx("div", { className: "kpi-value", children: kpi.history_epochs ?? 0 })] })] })] }), _jsxs("section", { className: "panel", children: [_jsx("h4", { children: "Lanzar reentrenamiento" }), _jsxs("form", { onSubmit: submit, className: "grid", children: [_jsxs("div", { className: "grid grid-2", children: [_jsx("input", { value: form.remote_user, onChange: (e) => setForm({ ...form, remote_user: e.target.value }), placeholder: "remote_user" }), _jsx("input", { value: form.remote_host, onChange: (e) => setForm({ ...form, remote_host: e.target.value }), placeholder: "remote_host" }), _jsx("input", { value: form.remote_venv_activate, onChange: (e) => setForm({ ...form, remote_venv_activate: e.target.value }), placeholder: "remote_venv_activate" }), _jsx("input", { value: form.local_dataset_dir, onChange: (e) => setForm({ ...form, local_dataset_dir: e.target.value }), placeholder: "local_dataset_dir" }), _jsx("input", { value: form.local_output_dir, onChange: (e) => setForm({ ...form, local_output_dir: e.target.value }), placeholder: "local_output_dir" }), _jsx("input", { type: "number", value: form.epochs, onChange: (e) => setForm({ ...form, epochs: Number(e.target.value) }), placeholder: "epochs" }), _jsx("input", { type: "number", value: form.batch_size, onChange: (e) => setForm({ ...form, batch_size: Number(e.target.value) }), placeholder: "batch_size" }), _jsx("input", { type: "number", value: form.window_size, onChange: (e) => setForm({ ...form, window_size: Number(e.target.value) }), placeholder: "window_size" }), _jsx("input", { type: "number", value: form.stride, onChange: (e) => setForm({ ...form, stride: Number(e.target.value) }), placeholder: "stride" })] }), _jsx("button", { type: "submit", disabled: isRunning, children: isRunning ? `Reentrenamiento en curso... ${jobStatus?.job_id || jobId || ""}`.trim() : "Reentrenar preservando historial" })] })] }), _jsxs("section", { className: "panel", children: [_jsx("h4", { children: "Estado del job" }), _jsxs("div", { children: [_jsx("strong", { children: "Status:" }), " ", jobStatus?.status || "-"] }), _jsxs("div", { children: [_jsx("strong", { children: "Job ID:" }), " ", jobStatus?.job_id || jobId || "-"] }), _jsxs("div", { children: [_jsx("strong", { children: "Return code:" }), " ", String(jobStatus?.returncode ?? "-")] }), _jsxs("div", { className: "grid grid-2", style: { marginTop: 8 }, children: [_jsxs("div", { children: [_jsx("h5", { children: "STDOUT" }), _jsx("pre", { className: "log-box", children: jobStatus?.stdout || "" })] }), _jsxs("div", { children: [_jsx("h5", { children: "STDERR" }), _jsx("pre", { className: "log-box error-log", children: jobStatus?.stderr || "" })] })] })] }), _jsxs("section", { className: "panel", children: [_jsx("h4", { children: "Historial de versiones" }), _jsx("div", { className: "validation-table-wrap", children: _jsxs("table", { className: "validation-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Version ID" }), _jsx("th", { children: "Reason" }), _jsx("th", { children: "Created (UTC)" }), _jsx("th", { children: "Snapshot Dir" })] }) }), _jsxs("tbody", { children: [versions.map((v) => (_jsxs("tr", { children: [_jsx("td", { children: String(v.version_id) }), _jsx("td", { children: String(v.reason) }), _jsx("td", { children: String(v.created_at_utc) }), _jsx("td", { className: "small-path", children: String(v.snapshot_dir) })] }, String(v.version_id)))), versions.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, children: "No hay snapshots todav\u00EDa." }) }))] })] }) })] }), _jsxs("section", { className: "panel", children: [_jsx("h4", { children: "Evoluci\u00F3n reciente (tail)" }), _jsx("div", { className: "validation-table-wrap", children: _jsxs("table", { className: "validation-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Epoch" }), _jsx("th", { children: "Train Acc" }), _jsx("th", { children: "Test Acc" }), _jsx("th", { children: "Train Loss" }), _jsx("th", { children: "Test Loss" }), _jsx("th", { children: "Mode" })] }) }), _jsxs("tbody", { children: [historyTail.map((r, idx) => (_jsxs("tr", { children: [_jsx("td", { children: String(r.epoch) }), _jsx("td", { children: pct(Number(r.train_acc || 0)) }), _jsx("td", { children: pct(Number(r.test_acc || 0)) }), _jsx("td", { children: Number(r.train_loss || 0).toFixed(6) }), _jsx("td", { children: Number(r.test_loss || 0).toFixed(6) }), _jsx("td", { children: String(r.mode || "") })] }, `${String(r.epoch)}-${idx}`))), historyTail.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 6, children: "No hay historial de entrenamiento." }) }))] })] }) })] }), error && _jsx("pre", { style: { color: "#b42318", whiteSpace: "pre-wrap" }, children: error })] }));
}
