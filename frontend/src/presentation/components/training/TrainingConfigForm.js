import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { TrainingController } from "../../controllers/TrainingController";
const TRAINING_JOB_KEY = "rfp.training.jobId";
export function TrainingConfigForm() {
    const controller = useMemo(() => new TrainingController(), []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [startResult, setStartResult] = useState(null);
    const [jobStatus, setJobStatus] = useState(null);
    const [jobId, setJobId] = useState(() => localStorage.getItem(TRAINING_JOB_KEY) || "");
    const pollRef = useRef(null);
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
    const pollStatus = async (id) => {
        try {
            const status = await controller.status(id);
            setJobStatus(status);
            if (status?.job_id) {
                setJobId(status.job_id);
                localStorage.setItem(TRAINING_JOB_KEY, status.job_id);
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
            const res = await controller.start(form);
            setStartResult(res);
            if (res?.job_id) {
                setJobId(res.job_id);
                localStorage.setItem(TRAINING_JOB_KEY, res.job_id);
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
    const effectiveStatus = String(jobStatus?.status || startResult?.status || "").toLowerCase();
    const isTrainingRunning = loading || effectiveStatus === "running";
    return (_jsxs("div", { className: "panel", children: [_jsx("h3", { children: "Remote Training" }), _jsxs("form", { onSubmit: submit, className: "grid", children: [_jsx("input", { value: form.remote_user, onChange: (e) => setForm({ ...form, remote_user: e.target.value }), placeholder: "remote user" }), _jsx("input", { value: form.remote_host, onChange: (e) => setForm({ ...form, remote_host: e.target.value }), placeholder: "remote host" }), _jsx("input", { value: form.remote_venv_activate, onChange: (e) => setForm({ ...form, remote_venv_activate: e.target.value }), placeholder: "venv activate path" }), _jsx("input", { value: form.local_dataset_dir, onChange: (e) => setForm({ ...form, local_dataset_dir: e.target.value }), placeholder: "dataset dir" }), _jsx("input", { value: form.local_output_dir, onChange: (e) => setForm({ ...form, local_output_dir: e.target.value }), placeholder: "output dir" }), _jsx("input", { type: "number", value: form.epochs, onChange: (e) => setForm({ ...form, epochs: Number(e.target.value) }), placeholder: "epochs" }), _jsx("button", { disabled: isTrainingRunning, type: "submit", children: isTrainingRunning
                            ? `Entrenando en curso... ${jobStatus?.job_id || startResult?.job_id || jobId || ""}`.trim()
                            : "Lanzar training remoto" })] }), error && _jsx("pre", { style: { color: "#b42318", whiteSpace: "pre-wrap" }, children: error }), startResult && (_jsxs("div", { style: { marginTop: 12 }, children: [_jsx("strong", { children: "Job ID:" }), " ", jobId, _jsx("pre", { style: { whiteSpace: "pre-wrap" }, children: JSON.stringify(startResult, null, 2) })] })), jobStatus && (_jsxs("div", { style: { marginTop: 12 }, children: [_jsxs("h4", { children: ["Estado: ", jobStatus.status] }), _jsxs("div", { children: [_jsx("strong", { children: "Job ID:" }), " ", jobStatus.job_id || jobId || "-"] }), _jsxs("div", { children: [_jsx("strong", { children: "Return code:" }), " ", String(jobStatus.returncode)] }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }, children: [_jsxs("div", { children: [_jsx("h5", { children: "STDOUT" }), _jsx("pre", { style: { whiteSpace: "pre-wrap", maxHeight: 320, overflow: "auto", background: "#f8fafc", padding: 8 }, children: jobStatus.stdout || "" })] }), _jsxs("div", { children: [_jsx("h5", { children: "STDERR" }), _jsx("pre", { style: { whiteSpace: "pre-wrap", maxHeight: 320, overflow: "auto", background: "#fff1f2", padding: 8 }, children: jobStatus.stderr || "" })] })] })] }))] }));
}
