import { useState } from "react";
import { DatasetRecordsManager } from "../components/dataset/DatasetRecordsManager";
import { DatasetStatsPanel } from "../components/dataset/DatasetStatsPanel";

export function DatasetManagerView() {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="grid">
      <DatasetStatsPanel refreshToken={refreshToken} />
      <DatasetRecordsManager onChanged={() => setRefreshToken((v) => v + 1)} />
    </div>
  );
}
