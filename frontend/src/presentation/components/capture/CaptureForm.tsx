import { FormEvent, useState } from "react";
import { CaptureController } from "../../controllers/CaptureController";

interface CaptureFormProps {
  onCreated?: () => void;
}

export function CaptureForm({ onCreated }: CaptureFormProps) {
  const controller = new CaptureController();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await controller.create(form);
      setResult(res);
      onCreated?.();
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h3>Capture RF</h3>
      <form onSubmit={submit} className="grid">
        <input value={form.emitter_device_id} onChange={(e) => setForm({ ...form, emitter_device_id: e.target.value })} placeholder="emitter_device_id" />
        <input value={form.session_id} onChange={(e) => setForm({ ...form, session_id: e.target.value })} placeholder="session_id" />
        <input value={form.frequency_mhz} type="number" step="0.000001" onChange={(e) => setForm({ ...form, frequency_mhz: Number(e.target.value) })} placeholder="frequency MHz" />
        <input value={form.sample_rate_hz} type="number" onChange={(e) => setForm({ ...form, sample_rate_hz: Number(e.target.value) })} placeholder="sample_rate_hz" />
        <input value={form.duration_seconds} type="number" step="0.1" onChange={(e) => setForm({ ...form, duration_seconds: Number(e.target.value) })} placeholder="duration_seconds" />
        <input value={form.gain_db} type="number" step="0.1" onChange={(e) => setForm({ ...form, gain_db: Number(e.target.value) })} placeholder="gain_db" />
        <select value={form.split} onChange={(e) => setForm({ ...form, split: e.target.value })}>
          <option value="train">train</option>
          <option value="val">val</option>
        </select>
        <input value={form.python_exe} onChange={(e) => setForm({ ...form, python_exe: e.target.value })} placeholder="python executable" />
        <button disabled={loading} type="submit">{loading ? "Capturando..." : "Capturar"}</button>
      </form>

      {error && <pre style={{ color: "#b42318", whiteSpace: "pre-wrap" }}>{error}</pre>}
      {result && <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
