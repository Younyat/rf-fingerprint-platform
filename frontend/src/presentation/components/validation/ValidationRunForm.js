import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ValidationController } from "../../controllers/ValidationController";
export function ValidationRunForm() {
    const controller = new ValidationController();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [form, setForm] = useState({
        val_root: "rf_dataset_val",
        model_dir: "remote_trained_model",
        output_json: "validation_report.json",
        batch_size: 256,
        python_exe: "C:/Users/Usuario/radioconda/python.exe",
    });
    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await controller.run(form);
            setResult(res);
        }
        catch (err) {
            setError(String(err));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "panel", children: [_jsx("h3", { children: "Validation Lab" }), _jsxs("form", { onSubmit: submit, className: "grid", children: [_jsx("input", { value: form.val_root, onChange: (e) => setForm({ ...form, val_root: e.target.value }), placeholder: "val_root" }), _jsx("input", { value: form.model_dir, onChange: (e) => setForm({ ...form, model_dir: e.target.value }), placeholder: "model_dir" }), _jsx("input", { value: form.output_json, onChange: (e) => setForm({ ...form, output_json: e.target.value }), placeholder: "output_json" }), _jsx("input", { value: form.python_exe, onChange: (e) => setForm({ ...form, python_exe: e.target.value }), placeholder: "python_exe" }), _jsx("button", { disabled: loading, type: "submit", children: loading ? "Validando..." : "Ejecutar validación" })] }), error && _jsx("pre", { style: { color: "#b42318", whiteSpace: "pre-wrap" }, children: error }), result && _jsx("pre", { style: { whiteSpace: "pre-wrap" }, children: JSON.stringify(result, null, 2) })] }));
}
