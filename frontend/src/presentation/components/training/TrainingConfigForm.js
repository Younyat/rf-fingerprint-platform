import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { TrainingController } from "../../controllers/TrainingController";
export function TrainingConfigForm() {
    const controller = new TrainingController();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
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
    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await controller.start(form);
            setResult(res);
        }
        catch (err) {
            setError(String(err));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "panel", children: [_jsx("h3", { children: "Remote Training" }), _jsxs("form", { onSubmit: submit, className: "grid", children: [_jsx("input", { value: form.remote_user, onChange: (e) => setForm({ ...form, remote_user: e.target.value }), placeholder: "remote user" }), _jsx("input", { value: form.remote_host, onChange: (e) => setForm({ ...form, remote_host: e.target.value }), placeholder: "remote host" }), _jsx("input", { value: form.remote_venv_activate, onChange: (e) => setForm({ ...form, remote_venv_activate: e.target.value }), placeholder: "venv activate path" }), _jsx("input", { value: form.local_dataset_dir, onChange: (e) => setForm({ ...form, local_dataset_dir: e.target.value }), placeholder: "dataset dir" }), _jsx("input", { value: form.local_output_dir, onChange: (e) => setForm({ ...form, local_output_dir: e.target.value }), placeholder: "output dir" }), _jsx("input", { type: "number", value: form.epochs, onChange: (e) => setForm({ ...form, epochs: Number(e.target.value) }), placeholder: "epochs" }), _jsx("button", { disabled: loading, type: "submit", children: loading ? "Entrenando..." : "Lanzar training remoto" })] }), error && _jsx("pre", { style: { color: "#b42318", whiteSpace: "pre-wrap" }, children: error }), result && _jsx("pre", { style: { whiteSpace: "pre-wrap" }, children: JSON.stringify(result, null, 2) })] }));
}
