import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { CaptureController } from "../../controllers/CaptureController";
import { InferenceController } from "../../controllers/InferenceController";
const PREDICT_CAPTURE_JOB_KEY = "rfp.predict.capture.jobId";
const PREDICTION_JOB_KEY = "rfp.predict.jobId";
function pct(v) {
    return `${(v * 100).toFixed(2)}%`;
}
export function InferenceForm() {
    const captureController = useMemo(() => new CaptureController(), []);
    const inferenceController = useMemo(() => new InferenceController(), []);
    const capturePollRef = useRef(null);
    const predictionPollRef = useRef(null);
    const [error, setError] = useState("");
    const [captures, setCaptures] = useState([]);
    const [selectedCapturePath, setSelectedCapturePath] = useState("");
    const [captureFilter, setCaptureFilter] = useState("");
    const [loadingCaptures, setLoadingCaptures] = useState(false);
    const [captureForm, setCaptureForm] = useState({
        emitter_device_id: "candidate_001",
        session_id: "predict_session_001",
        receiver_id: "usrp_b200_01",
        environment_id: "lab_a",
        frequency_mhz: 89.4,
        sample_rate_hz: 2000000,
        duration_seconds: 5,
        gain_db: 20,
        python_exe: "C:/Users/Usuario/radioconda/python.exe",
    });
    const [captureJobId, setCaptureJobId] = useState(() => localStorage.getItem(PREDICT_CAPTURE_JOB_KEY) || "");
    const [captureStatus, setCaptureStatus] = useState(null);
    const [startingCapture, setStartingCapture] = useState(false);
    const [predictionJobId, setPredictionJobId] = useState(() => localStorage.getItem(PREDICTION_JOB_KEY) || "");
    const [predictionStatus, setPredictionStatus] = useState(null);
    const [startingPrediction, setStartingPrediction] = useState(false);
    const [predictionForm, setPredictionForm] = useState({
        model_dir: "remote_trained_model",
        output_json: "inference/prediction_report.json",
        batch_size: 256,
        python_exe: "C:/Users/Usuario/radioconda/python.exe",
    });
    const loadPredictionCaptures = async () => {
        setLoadingCaptures(true);
        setError("");
        try {
            const rows = (await inferenceController.listPredictionCaptures());
            setCaptures(rows || []);
            if (!selectedCapturePath && rows.length > 0) {
                setSelectedCapturePath(rows[0].metadata_path);
            }
        }
        catch (err) {
            setError(String(err));
        }
        finally {
            setLoadingCaptures(false);
        }
    };
    const stopCapturePolling = () => {
        if (capturePollRef.current !== null) {
            window.clearInterval(capturePollRef.current);
            capturePollRef.current = null;
        }
    };
    const stopPredictionPolling = () => {
        if (predictionPollRef.current !== null) {
            window.clearInterval(predictionPollRef.current);
            predictionPollRef.current = null;
        }
    };
    const pollCaptureStatus = async (id) => {
        try {
            const status = await captureController.status(id);
            setCaptureStatus(status);
            if (status?.job_id) {
                setCaptureJobId(status.job_id);
                localStorage.setItem(PREDICT_CAPTURE_JOB_KEY, status.job_id);
            }
            if (status.status === "completed" || status.status === "failed") {
                stopCapturePolling();
                if (status.status === "completed") {
                    await loadPredictionCaptures();
                }
            }
        }
        catch (err) {
            setError(String(err));
            stopCapturePolling();
        }
    };
    const pollPredictionStatus = async (id) => {
        try {
            const status = await inferenceController.predictionStatus(id);
            setPredictionStatus(status);
            if (status?.job_id) {
                setPredictionJobId(status.job_id);
                localStorage.setItem(PREDICTION_JOB_KEY, status.job_id);
            }
            if (status.status === "completed" || status.status === "failed") {
                stopPredictionPolling();
            }
        }
        catch (err) {
            setError(String(err));
            stopPredictionPolling();
        }
    };
    const startCapturePolling = (id) => {
        stopCapturePolling();
        void pollCaptureStatus(id);
        capturePollRef.current = window.setInterval(() => {
            void pollCaptureStatus(id || captureJobId || undefined);
        }, 1500);
    };
    const startPredictionPolling = (id) => {
        stopPredictionPolling();
        void pollPredictionStatus(id);
        predictionPollRef.current = window.setInterval(() => {
            void pollPredictionStatus(id || predictionJobId || undefined);
        }, 2000);
    };
    useEffect(() => {
        void loadPredictionCaptures();
        if (captureJobId)
            startCapturePolling(captureJobId);
        if (predictionJobId)
            startPredictionPolling(predictionJobId);
        return () => {
            stopCapturePolling();
            stopPredictionPolling();
        };
    }, []);
    const submitCapture = async (e) => {
        e.preventDefault();
        setStartingCapture(true);
        setError("");
        try {
            const res = await captureController.start({
                ...captureForm,
                split: "predict",
            });
            if (res?.job_id) {
                setCaptureJobId(res.job_id);
                localStorage.setItem(PREDICT_CAPTURE_JOB_KEY, res.job_id);
                startCapturePolling(res.job_id);
            }
        }
        catch (err) {
            setError(String(err));
        }
        finally {
            setStartingCapture(false);
        }
    };
    const selectedCapture = captures.find((c) => c.metadata_path === selectedCapturePath) || null;
    const isPredictionRunning = startingPrediction || String(predictionStatus?.status || "").toLowerCase() === "running";
    const submitPrediction = async (e) => {
        e.preventDefault();
        if (!selectedCapture)
            return;
        setStartingPrediction(true);
        setError("");
        try {
            const res = await inferenceController.startPrediction({
                ...predictionForm,
                cfile_path: selectedCapture.cfile_path,
                metadata_path: selectedCapture.metadata_path,
            });
            if (res?.job_id) {
                setPredictionJobId(res.job_id);
                localStorage.setItem(PREDICTION_JOB_KEY, res.job_id);
                startPredictionPolling(res.job_id);
            }
        }
        catch (err) {
            setError(String(err));
        }
        finally {
            setStartingPrediction(false);
        }
    };
    const filteredCaptures = captures.filter((c) => {
        const q = captureFilter.trim().toLowerCase();
        if (!q)
            return true;
        const raw = `${c.emitter_device_id} ${c.session_id} ${c.metadata_path}`.toLowerCase();
        return raw.includes(q);
    });
    const report = predictionStatus?.report || null;
    const pred = report?.prediction || null;
    const interp = report?.scientific_interpretation || null;
    return (_jsxs("div", { className: "grid", children: [_jsxs("section", { className: "panel validation-hero", children: [_jsxs("div", { children: [_jsx("h3", { children: "Prediction Lab" }), _jsx("p", { children: "Captura se\u00F1ales para inferencia en directorio separado y ejecuta predicci\u00F3n con interpretaci\u00F3n cient\u00EDfica." })] }), _jsx("div", { className: "validation-hero-badge", children: "Inference QA" })] }), _jsxs("section", { className: "panel", children: [_jsx("h4", { children: "1) Captura para predicci\u00F3n (`data/rf_dataset_predict`)" }), _jsxs("form", { onSubmit: submitCapture, className: "grid", children: [_jsxs("div", { className: "grid grid-2", children: [_jsx("input", { value: captureForm.emitter_device_id, onChange: (e) => setCaptureForm({ ...captureForm, emitter_device_id: e.target.value }), placeholder: "emitter_device_id" }), _jsx("input", { value: captureForm.session_id, onChange: (e) => setCaptureForm({ ...captureForm, session_id: e.target.value }), placeholder: "session_id" }), _jsx("input", { type: "number", step: "0.000001", value: captureForm.frequency_mhz, onChange: (e) => setCaptureForm({ ...captureForm, frequency_mhz: Number(e.target.value) }), placeholder: "frequency_mhz" }), _jsx("input", { type: "number", value: captureForm.sample_rate_hz, onChange: (e) => setCaptureForm({ ...captureForm, sample_rate_hz: Number(e.target.value) }), placeholder: "sample_rate_hz" }), _jsx("input", { type: "number", step: "0.1", value: captureForm.duration_seconds, onChange: (e) => setCaptureForm({ ...captureForm, duration_seconds: Number(e.target.value) }), placeholder: "duration_seconds" }), _jsx("input", { type: "number", step: "0.1", value: captureForm.gain_db, onChange: (e) => setCaptureForm({ ...captureForm, gain_db: Number(e.target.value) }), placeholder: "gain_db" }), _jsx("input", { value: captureForm.receiver_id, onChange: (e) => setCaptureForm({ ...captureForm, receiver_id: e.target.value }), placeholder: "receiver_id" }), _jsx("input", { value: captureForm.environment_id, onChange: (e) => setCaptureForm({ ...captureForm, environment_id: e.target.value }), placeholder: "environment_id" })] }), _jsx("button", { type: "submit", disabled: startingCapture || String(captureStatus?.status || "").toLowerCase() === "running", children: startingCapture || String(captureStatus?.status || "").toLowerCase() === "running"
                                    ? `Capturando... ${captureStatus?.job_id || captureJobId || ""}`.trim()
                                    : "Capturar señal para predicción" })] }), captureStatus && (_jsxs("div", { style: { marginTop: 8 }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Capture status:" }), " ", captureStatus.status] }), _jsx("pre", { className: "log-box", children: captureStatus.stdout || "" }), !!captureStatus.stderr && _jsx("pre", { className: "log-box error-log", children: captureStatus.stderr })] }))] }), _jsxs("section", { className: "panel", children: [_jsx("h4", { children: "2) Selecci\u00F3n de captura de predicci\u00F3n" }), _jsxs("div", { className: "validation-capture-actions", children: [_jsx("button", { type: "button", onClick: () => void loadPredictionCaptures(), disabled: loadingCaptures, children: loadingCaptures ? "Recargando..." : "Recargar" }), _jsx("input", { value: captureFilter, onChange: (e) => setCaptureFilter(e.target.value), placeholder: "Filtrar capturas predict" })] }), _jsx("div", { className: "validation-table-wrap", style: { marginTop: 8 }, children: _jsxs("table", { className: "validation-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Sel" }), _jsx("th", { children: "Device" }), _jsx("th", { children: "Session" }), _jsx("th", { children: "SR (Hz)" }), _jsx("th", { children: "Metadata" })] }) }), _jsxs("tbody", { children: [filteredCaptures.map((c) => (_jsxs("tr", { children: [_jsx("td", { children: _jsx("input", { type: "radio", checked: selectedCapturePath === c.metadata_path, onChange: () => setSelectedCapturePath(c.metadata_path) }) }), _jsx("td", { children: c.emitter_device_id }), _jsx("td", { children: c.session_id }), _jsx("td", { children: c.sample_rate_hz }), _jsx("td", { className: "small-path", children: c.metadata_path })] }, c.metadata_path))), filteredCaptures.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 5, children: "No hay capturas en `rf_dataset_predict`." }) }))] })] }) })] }), _jsxs("section", { className: "panel", children: [_jsx("h4", { children: "3) Ejecutar predicci\u00F3n con modelo" }), _jsxs("form", { onSubmit: submitPrediction, className: "grid", children: [_jsxs("div", { className: "grid grid-2", children: [_jsx("input", { value: predictionForm.model_dir, onChange: (e) => setPredictionForm({ ...predictionForm, model_dir: e.target.value }), placeholder: "model_dir" }), _jsx("input", { value: predictionForm.output_json, onChange: (e) => setPredictionForm({ ...predictionForm, output_json: e.target.value }), placeholder: "output_json" }), _jsx("input", { type: "number", value: predictionForm.batch_size, onChange: (e) => setPredictionForm({ ...predictionForm, batch_size: Number(e.target.value) }), placeholder: "batch_size" }), _jsx("input", { value: predictionForm.python_exe, onChange: (e) => setPredictionForm({ ...predictionForm, python_exe: e.target.value }), placeholder: "python_exe" })] }), _jsx("button", { type: "submit", disabled: !selectedCapture || isPredictionRunning, children: isPredictionRunning
                                    ? `Predicción en curso... ${predictionStatus?.job_id || predictionJobId || ""}`.trim()
                                    : `Predecir sobre captura seleccionada` })] }), predictionStatus && (_jsxs("div", { style: { marginTop: 8 }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Status:" }), " ", predictionStatus.status] }), _jsxs("div", { children: [_jsx("strong", { children: "Job ID:" }), " ", predictionStatus.job_id || predictionJobId || "-"] })] }))] }), report && pred && (_jsxs("section", { className: "panel validation-summary", children: [_jsxs("div", { className: "validation-summary-top", children: [_jsx("h3", { children: "Prediction Report" }), _jsx("span", { className: `quality ${pred.is_known ? "quality-high" : "quality-low"}`, children: pred.is_known ? "Known" : "Unknown/Suspicious" })] }), _jsxs("div", { className: "validation-kpi-grid", children: [_jsxs("div", { className: "validation-kpi", children: [_jsx("div", { className: "kpi-label", children: "Predicted Device" }), _jsx("div", { className: "kpi-value", children: pred.predicted_device })] }), _jsxs("div", { className: "validation-kpi", children: [_jsx("div", { className: "kpi-label", children: "Nearest Profile" }), _jsx("div", { className: "kpi-value", children: pred.nearest_profile_device })] }), _jsxs("div", { className: "validation-kpi", children: [_jsx("div", { className: "kpi-label", children: "Mean Probability" }), _jsx("div", { className: "kpi-value", children: pct(pred.predicted_probability_mean || 0) })] }), _jsxs("div", { className: "validation-kpi", children: [_jsx("div", { className: "kpi-label", children: "Entropy" }), _jsx("div", { className: "kpi-value", children: Number(pred.probability_entropy || 0).toFixed(4) })] }), _jsxs("div", { className: "validation-kpi", children: [_jsx("div", { className: "kpi-label", children: "Dist to Pred Profile" }), _jsx("div", { className: "kpi-value", children: Number(pred.distance_to_predicted_profile || 0).toFixed(4) })] }), _jsxs("div", { className: "validation-kpi", children: [_jsx("div", { className: "kpi-label", children: "Distance Margin" }), _jsx("div", { className: "kpi-value", children: Number(pred.distance_margin_to_second_profile || 0).toFixed(4) })] })] }), interp && (_jsxs("div", { className: "validation-interpretation", children: [_jsx("strong", { children: "Interpretaci\u00F3n:" }), " confidence=", String(interp.prediction_confidence_level), " | flags=", (interp.risk_flags || []).join(", ") || "none"] })), _jsx("div", { className: "validation-table-wrap", style: { marginTop: 12 }, children: _jsxs("table", { className: "validation-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Profile Device" }), _jsx("th", { children: "Distance" }), _jsx("th", { children: "Class Mean Probability" })] }) }), _jsx("tbody", { children: Object.keys(pred.all_profile_distances || {}).sort((a, b) => pred.all_profile_distances[a] - pred.all_profile_distances[b]).map((dev) => (_jsxs("tr", { children: [_jsx("td", { children: dev }), _jsx("td", { children: Number(pred.all_profile_distances[dev]).toFixed(6) }), _jsx("td", { children: pct(Number((pred.class_probability_mean || {})[dev] || 0)) })] }, dev))) })] }) })] })), error && _jsx("pre", { style: { color: "#b42318", whiteSpace: "pre-wrap" }, children: error })] }));
}
