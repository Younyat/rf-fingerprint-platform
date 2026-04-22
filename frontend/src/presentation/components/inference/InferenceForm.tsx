import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CaptureController } from "../../controllers/CaptureController";
import { InferenceController } from "../../controllers/InferenceController";

const PREDICT_CAPTURE_JOB_KEY = "rfp.predict.capture.jobId";
const PREDICTION_JOB_KEY = "rfp.predict.jobId";

interface PredictionCaptureRecord {
  metadata_path: string;
  cfile_path: string;
  emitter_device_id: string;
  session_id: string;
  center_frequency_hz: number;
  sample_rate_hz: number;
  duration_seconds: number;
}

function pct(v: number): string {
  return `${(v * 100).toFixed(2)}%`;
}

export function InferenceForm() {
  const captureController = useMemo(() => new CaptureController(), []);
  const inferenceController = useMemo(() => new InferenceController(), []);

  const capturePollRef = useRef<number | null>(null);
  const predictionPollRef = useRef<number | null>(null);

  const [error, setError] = useState("");

  const [captures, setCaptures] = useState<PredictionCaptureRecord[]>([]);
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

  const [captureJobId, setCaptureJobId] = useState<string>(() => localStorage.getItem(PREDICT_CAPTURE_JOB_KEY) || "");
  const [captureStatus, setCaptureStatus] = useState<any>(null);
  const [startingCapture, setStartingCapture] = useState(false);

  const [predictionJobId, setPredictionJobId] = useState<string>(() => localStorage.getItem(PREDICTION_JOB_KEY) || "");
  const [predictionStatus, setPredictionStatus] = useState<any>(null);
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
      const rows = (await inferenceController.listPredictionCaptures()) as PredictionCaptureRecord[];
      setCaptures(rows || []);
      if (!selectedCapturePath && rows.length > 0) {
        setSelectedCapturePath(rows[0].metadata_path);
      }
    } catch (err: unknown) {
      setError(String(err));
    } finally {
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

  const pollCaptureStatus = async (id?: string) => {
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
    } catch (err: unknown) {
      setError(String(err));
      stopCapturePolling();
    }
  };

  const pollPredictionStatus = async (id?: string) => {
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
    } catch (err: unknown) {
      setError(String(err));
      stopPredictionPolling();
    }
  };

  const startCapturePolling = (id?: string) => {
    stopCapturePolling();
    void pollCaptureStatus(id);
    capturePollRef.current = window.setInterval(() => {
      void pollCaptureStatus(id || captureJobId || undefined);
    }, 1500);
  };

  const startPredictionPolling = (id?: string) => {
    stopPredictionPolling();
    void pollPredictionStatus(id);
    predictionPollRef.current = window.setInterval(() => {
      void pollPredictionStatus(id || predictionJobId || undefined);
    }, 2000);
  };

  useEffect(() => {
    void loadPredictionCaptures();
    if (captureJobId) startCapturePolling(captureJobId);
    if (predictionJobId) startPredictionPolling(predictionJobId);
    return () => {
      stopCapturePolling();
      stopPredictionPolling();
    };
  }, []);

  const submitCapture = async (e: FormEvent) => {
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
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setStartingCapture(false);
    }
  };

  const selectedCapture = captures.find((c) => c.metadata_path === selectedCapturePath) || null;
  const isPredictionRunning = startingPrediction || String(predictionStatus?.status || "").toLowerCase() === "running";

  const submitPrediction = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCapture) return;
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
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setStartingPrediction(false);
    }
  };

  const filteredCaptures = captures.filter((c) => {
    const q = captureFilter.trim().toLowerCase();
    if (!q) return true;
    const raw = `${c.emitter_device_id} ${c.session_id} ${c.metadata_path}`.toLowerCase();
    return raw.includes(q);
  });

  const report = predictionStatus?.report || null;
  const pred = report?.prediction || null;
  const interp = report?.scientific_interpretation || null;

  return (
    <div className="grid">
      <section className="panel validation-hero">
        <div>
          <h3>Prediction Lab</h3>
          <p>Captura señales para inferencia en directorio separado y ejecuta predicción con interpretación científica.</p>
        </div>
        <div className="validation-hero-badge">Inference QA</div>
      </section>

      <section className="panel">
        <h4>1) Captura para predicción (`data/rf_dataset_predict`)</h4>
        <form onSubmit={submitCapture} className="grid">
          <div className="grid grid-2">
            <input value={captureForm.emitter_device_id} onChange={(e) => setCaptureForm({ ...captureForm, emitter_device_id: e.target.value })} placeholder="emitter_device_id" />
            <input value={captureForm.session_id} onChange={(e) => setCaptureForm({ ...captureForm, session_id: e.target.value })} placeholder="session_id" />
            <input type="number" step="0.000001" value={captureForm.frequency_mhz} onChange={(e) => setCaptureForm({ ...captureForm, frequency_mhz: Number(e.target.value) })} placeholder="frequency_mhz" />
            <input type="number" value={captureForm.sample_rate_hz} onChange={(e) => setCaptureForm({ ...captureForm, sample_rate_hz: Number(e.target.value) })} placeholder="sample_rate_hz" />
            <input type="number" step="0.1" value={captureForm.duration_seconds} onChange={(e) => setCaptureForm({ ...captureForm, duration_seconds: Number(e.target.value) })} placeholder="duration_seconds" />
            <input type="number" step="0.1" value={captureForm.gain_db} onChange={(e) => setCaptureForm({ ...captureForm, gain_db: Number(e.target.value) })} placeholder="gain_db" />
            <input value={captureForm.receiver_id} onChange={(e) => setCaptureForm({ ...captureForm, receiver_id: e.target.value })} placeholder="receiver_id" />
            <input value={captureForm.environment_id} onChange={(e) => setCaptureForm({ ...captureForm, environment_id: e.target.value })} placeholder="environment_id" />
          </div>
          <button type="submit" disabled={startingCapture || String(captureStatus?.status || "").toLowerCase() === "running"}>
            {startingCapture || String(captureStatus?.status || "").toLowerCase() === "running"
              ? `Capturando... ${captureStatus?.job_id || captureJobId || ""}`.trim()
              : "Capturar señal para predicción"}
          </button>
        </form>
        {captureStatus && (
          <div style={{ marginTop: 8 }}>
            <div><strong>Capture status:</strong> {captureStatus.status}</div>
            <pre className="log-box">{captureStatus.stdout || ""}</pre>
            {!!captureStatus.stderr && <pre className="log-box error-log">{captureStatus.stderr}</pre>}
          </div>
        )}
      </section>

      <section className="panel">
        <h4>2) Selección de captura de predicción</h4>
        <div className="validation-capture-actions">
          <button type="button" onClick={() => void loadPredictionCaptures()} disabled={loadingCaptures}>
            {loadingCaptures ? "Recargando..." : "Recargar"}
          </button>
          <input value={captureFilter} onChange={(e) => setCaptureFilter(e.target.value)} placeholder="Filtrar capturas predict" />
        </div>
        <div className="validation-table-wrap" style={{ marginTop: 8 }}>
          <table className="validation-table">
            <thead>
              <tr>
                <th>Sel</th>
                <th>Device</th>
                <th>Session</th>
                <th>SR (Hz)</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {filteredCaptures.map((c) => (
                <tr key={c.metadata_path}>
                  <td>
                    <input
                      type="radio"
                      checked={selectedCapturePath === c.metadata_path}
                      onChange={() => setSelectedCapturePath(c.metadata_path)}
                    />
                  </td>
                  <td>{c.emitter_device_id}</td>
                  <td>{c.session_id}</td>
                  <td>{c.sample_rate_hz}</td>
                  <td className="small-path">{c.metadata_path}</td>
                </tr>
              ))}
              {filteredCaptures.length === 0 && (
                <tr>
                  <td colSpan={5}>No hay capturas en `rf_dataset_predict`.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h4>3) Ejecutar predicción con modelo</h4>
        <form onSubmit={submitPrediction} className="grid">
          <div className="grid grid-2">
            <input value={predictionForm.model_dir} onChange={(e) => setPredictionForm({ ...predictionForm, model_dir: e.target.value })} placeholder="model_dir" />
            <input value={predictionForm.output_json} onChange={(e) => setPredictionForm({ ...predictionForm, output_json: e.target.value })} placeholder="output_json" />
            <input type="number" value={predictionForm.batch_size} onChange={(e) => setPredictionForm({ ...predictionForm, batch_size: Number(e.target.value) })} placeholder="batch_size" />
            <input value={predictionForm.python_exe} onChange={(e) => setPredictionForm({ ...predictionForm, python_exe: e.target.value })} placeholder="python_exe" />
          </div>
          <button type="submit" disabled={!selectedCapture || isPredictionRunning}>
            {isPredictionRunning
              ? `Predicción en curso... ${predictionStatus?.job_id || predictionJobId || ""}`.trim()
              : `Predecir sobre captura seleccionada`}
          </button>
        </form>

        {predictionStatus && (
          <div style={{ marginTop: 8 }}>
            <div><strong>Status:</strong> {predictionStatus.status}</div>
            <div><strong>Job ID:</strong> {predictionStatus.job_id || predictionJobId || "-"}</div>
          </div>
        )}
      </section>

      {report && pred && (
        <section className="panel validation-summary">
          <div className="validation-summary-top">
            <h3>Prediction Report</h3>
            <span className={`quality ${pred.is_known ? "quality-high" : "quality-low"}`}>
              {pred.is_known ? "Known" : "Unknown/Suspicious"}
            </span>
          </div>
          <div className="validation-kpi-grid">
            <div className="validation-kpi"><div className="kpi-label">Predicted Device</div><div className="kpi-value">{pred.predicted_device}</div></div>
            <div className="validation-kpi"><div className="kpi-label">Nearest Profile</div><div className="kpi-value">{pred.nearest_profile_device}</div></div>
            <div className="validation-kpi"><div className="kpi-label">Mean Probability</div><div className="kpi-value">{pct(pred.predicted_probability_mean || 0)}</div></div>
            <div className="validation-kpi"><div className="kpi-label">Entropy</div><div className="kpi-value">{Number(pred.probability_entropy || 0).toFixed(4)}</div></div>
            <div className="validation-kpi"><div className="kpi-label">Dist to Pred Profile</div><div className="kpi-value">{Number(pred.distance_to_predicted_profile || 0).toFixed(4)}</div></div>
            <div className="validation-kpi"><div className="kpi-label">Distance Margin</div><div className="kpi-value">{Number(pred.distance_margin_to_second_profile || 0).toFixed(4)}</div></div>
          </div>
          {interp && (
            <div className="validation-interpretation">
              <strong>Interpretación:</strong> confidence={String(interp.prediction_confidence_level)} | flags={(interp.risk_flags || []).join(", ") || "none"}
            </div>
          )}
          <div className="validation-table-wrap" style={{ marginTop: 12 }}>
            <table className="validation-table">
              <thead>
                <tr>
                  <th>Profile Device</th>
                  <th>Distance</th>
                  <th>Class Mean Probability</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(pred.all_profile_distances || {}).sort((a, b) => pred.all_profile_distances[a] - pred.all_profile_distances[b]).map((dev) => (
                  <tr key={dev}>
                    <td>{dev}</td>
                    <td>{Number(pred.all_profile_distances[dev]).toFixed(6)}</td>
                    <td>{pct(Number((pred.class_probability_mean || {})[dev] || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {error && <pre style={{ color: "#b42318", whiteSpace: "pre-wrap" }}>{error}</pre>}
    </div>
  );
}
