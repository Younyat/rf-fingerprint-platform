import { useEffect, useState } from "react";
import { DatasetController } from "../controllers/DatasetController";

export function useDataset() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { new DatasetController().stats().then(setStats).catch(() => undefined); }, []);
  return { stats };
}
