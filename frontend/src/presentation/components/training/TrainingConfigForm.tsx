import { FormEvent, useState } from "react";
import { TrainingController } from "../../controllers/TrainingController";

export function TrainingConfigForm() {
  const controller = new TrainingController();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await controller.start(form);
      setResult(res);
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h3>Remote Training</h3>
      <form onSubmit={submit} className="grid">
        <input value={form.remote_user} onChange={(e) => setForm({ ...form, remote_user: e.target.value })} placeholder="remote user" />
        <input value={form.remote_host} onChange={(e) => setForm({ ...form, remote_host: e.target.value })} placeholder="remote host" />
        <input value={form.remote_venv_activate} onChange={(e) => setForm({ ...form, remote_venv_activate: e.target.value })} placeholder="venv activate path" />
        <input value={form.local_dataset_dir} onChange={(e) => setForm({ ...form, local_dataset_dir: e.target.value })} placeholder="dataset dir" />
        <input value={form.local_output_dir} onChange={(e) => setForm({ ...form, local_output_dir: e.target.value })} placeholder="output dir" />
        <input type="number" value={form.epochs} onChange={(e) => setForm({ ...form, epochs: Number(e.target.value) })} placeholder="epochs" />
        <button disabled={loading} type="submit">{loading ? "Entrenando..." : "Lanzar training remoto"}</button>
      </form>

      {error && <pre style={{ color: "#b42318", whiteSpace: "pre-wrap" }}>{error}</pre>}
      {result && <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
