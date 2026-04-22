import { Link } from "react-router-dom";

export function DashboardView() {
  return (
    <div className="grid grid-2">
      <div className="panel">
        <h3>Capture Lab</h3>
        <p>Captura señales RF y genera dataset train/val.</p>
        <Link to="/capture">Ir a captura</Link>
      </div>
      <div className="panel">
        <h3>Training Lab</h3>
        <p>Lanza entrenamiento remoto con GPU.</p>
        <Link to="/training">Ir a training</Link>
      </div>
      <div className="panel">
        <h3>Continual Retraining</h3>
        <p>Reentrena preservando historial completo y trazabilidad de versiones.</p>
        <Link to="/retraining">Ir a retraining</Link>
      </div>
      <div className="panel">
        <h3>Validation Lab</h3>
        <p>Valida modelo con dataset separado de validación.</p>
        <Link to="/validation">Ir a validación</Link>
      </div>
      <div className="panel">
        <h3>Dataset Manager</h3>
        <p>Consulta stats y reglas científicas básicas del dataset.</p>
        <Link to="/dataset">Ir a dataset</Link>
      </div>
    </div>
  );
}
