import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { CaptureController } from "../../controllers/CaptureController";
const CAPTURE_JOB_KEY = "rfp.capture.jobId";
export function CaptureForm({ onCreated }) {
    const controller = useMemo(() => new CaptureController(), []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [startResult, setStartResult] = useState(null);
    const [jobStatus, setJobStatus] = useState(null);
    const [jobId, setJobId] = useState(() => localStorage.getItem(CAPTURE_JOB_KEY) || "");
    const pollRef = useRef(null);
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
    const pollStatus = async (id) => {
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
        }, 1500);
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
                localStorage.setItem(CAPTURE_JOB_KEY, res.job_id);
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
    const isCaptureRunning = loading || effectiveStatus === "running";
    return (_jsxs("div", { className: "panel", children: [_jsx("h3", { children: "Capture RF" }), _jsxs("form", { onSubmit: submit, className: "grid", children: [_jsx("input", { value: form.emitter_device_id, onChange: (e) => setForm({ ...form, emitter_device_id: e.target.value }), placeholder: "emitter_device_id" }), _jsx("input", { value: form.session_id, onChange: (e) => setForm({ ...form, session_id: e.target.value }), placeholder: "session_id" }), _jsx("input", { value: form.frequency_mhz, type: "number", step: "0.000001", onChange: (e) => setForm({ ...form, frequency_mhz: Number(e.target.value) }), placeholder: "frequency MHz" }), _jsx("input", { value: form.sample_rate_hz, type: "number", onChange: (e) => setForm({ ...form, sample_rate_hz: Number(e.target.value) }), placeholder: "sample_rate_hz" }), _jsx("input", { value: form.duration_seconds, type: "number", step: "0.1", onChange: (e) => setForm({ ...form, duration_seconds: Number(e.target.value) }), placeholder: "duration_seconds" }), _jsx("input", { value: form.gain_db, type: "number", step: "0.1", onChange: (e) => setForm({ ...form, gain_db: Number(e.target.value) }), placeholder: "gain_db" }), _jsxs("select", { value: form.split, onChange: (e) => setForm({ ...form, split: e.target.value }), children: [_jsx("option", { value: "train", children: "train" }), _jsx("option", { value: "val", children: "val" }), _jsx("option", { value: "predict", children: "predict" })] }), _jsx("input", { value: form.python_exe, onChange: (e) => setForm({ ...form, python_exe: e.target.value }), placeholder: "python executable" }), _jsx("button", { disabled: isCaptureRunning, type: "submit", children: isCaptureRunning
                            ? `Captura en curso... ${jobStatus?.job_id || startResult?.job_id || jobId || ""}`.trim()
                            : "Capturar" })] }), error && _jsx("pre", { style: { color: "#b42318", whiteSpace: "pre-wrap" }, children: error }), startResult && _jsx("pre", { style: { whiteSpace: "pre-wrap" }, children: JSON.stringify(startResult, null, 2) }), jobStatus && (_jsxs("div", { style: { marginTop: 10 }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Estado:" }), " ", jobStatus.status] }), _jsxs("div", { children: [_jsx("strong", { children: "Job ID:" }), " ", jobStatus.job_id || jobId || "-"] }), _jsx("pre", { className: "log-box", children: jobStatus.stdout || "" }), !!jobStatus.stderr && _jsx("pre", { className: "log-box error-log", children: jobStatus.stderr })] }))] }));
}
