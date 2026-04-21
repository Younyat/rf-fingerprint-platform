import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { CaptureController } from "../../controllers/CaptureController";
export function CaptureForm({ onCreated }) {
    const controller = new CaptureController();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
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
    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await controller.create(form);
            setResult(res);
            onCreated?.();
        }
        catch (err) {
            setError(String(err));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "panel", children: [_jsx("h3", { children: "Capture RF" }), _jsxs("form", { onSubmit: submit, className: "grid", children: [_jsx("input", { value: form.emitter_device_id, onChange: (e) => setForm({ ...form, emitter_device_id: e.target.value }), placeholder: "emitter_device_id" }), _jsx("input", { value: form.session_id, onChange: (e) => setForm({ ...form, session_id: e.target.value }), placeholder: "session_id" }), _jsx("input", { value: form.frequency_mhz, type: "number", step: "0.000001", onChange: (e) => setForm({ ...form, frequency_mhz: Number(e.target.value) }), placeholder: "frequency MHz" }), _jsx("input", { value: form.sample_rate_hz, type: "number", onChange: (e) => setForm({ ...form, sample_rate_hz: Number(e.target.value) }), placeholder: "sample_rate_hz" }), _jsx("input", { value: form.duration_seconds, type: "number", step: "0.1", onChange: (e) => setForm({ ...form, duration_seconds: Number(e.target.value) }), placeholder: "duration_seconds" }), _jsx("input", { value: form.gain_db, type: "number", step: "0.1", onChange: (e) => setForm({ ...form, gain_db: Number(e.target.value) }), placeholder: "gain_db" }), _jsxs("select", { value: form.split, onChange: (e) => setForm({ ...form, split: e.target.value }), children: [_jsx("option", { value: "train", children: "train" }), _jsx("option", { value: "val", children: "val" })] }), _jsx("input", { value: form.python_exe, onChange: (e) => setForm({ ...form, python_exe: e.target.value }), placeholder: "python executable" }), _jsx("button", { disabled: loading, type: "submit", children: loading ? "Capturando..." : "Capturar" })] }), error && _jsx("pre", { style: { color: "#b42318", whiteSpace: "pre-wrap" }, children: error }), result && _jsx("pre", { style: { whiteSpace: "pre-wrap" }, children: JSON.stringify(result, null, 2) })] }));
}
