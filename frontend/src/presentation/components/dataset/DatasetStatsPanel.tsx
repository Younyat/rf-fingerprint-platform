import { useEffect, useState } from "react";
import { DatasetController } from "../../controllers/DatasetController";

export function DatasetStatsPanel() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    new DatasetController().stats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="panel">
      <h3>Dataset Stats</h3>
      <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(stats, null, 2)}</pre>
    </div>
  );
}
