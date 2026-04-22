import { useEffect, useState } from "react";
import { DatasetController } from "../../controllers/DatasetController";

interface DatasetStatsPanelProps {
  refreshToken?: number;
}

export function DatasetStatsPanel({ refreshToken }: DatasetStatsPanelProps) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    new DatasetController().stats().then(setStats).catch(() => setStats(null));
  }, [refreshToken]);

  return (
    <div className="panel">
      <h3>Dataset Stats</h3>
      <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(stats, null, 2)}</pre>
    </div>
  );
}
