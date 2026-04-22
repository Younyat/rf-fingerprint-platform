import { Link } from "react-router-dom";
import { AppRouter } from "./router";
import { AppProviders } from "./providers/AppProviders";

export function App() {
  return (
    <AppProviders>
      <main>
        <h1>RF Fingerprint Platform</h1>
        <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <Link to="/">Dashboard</Link>
          <Link to="/capture">Capture</Link>
          <Link to="/dataset">Dataset</Link>
          <Link to="/training">Training</Link>
          <Link to="/retraining">Retraining</Link>
          <Link to="/validation">Validation</Link>
          <Link to="/inference">Inference</Link>
          <Link to="/models">Models</Link>
        </nav>
        <AppRouter />
      </main>
    </AppProviders>
  );
}
