import { useEffect, useState } from "react";
import { CaptureController } from "../../controllers/CaptureController";

interface CaptureListProps {
  refreshToken?: number;
}

export function CaptureList({ refreshToken }: CaptureListProps) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    new CaptureController().list().then((r: any) => setItems(Array.isArray(r) ? r : [])).catch(() => setItems([]));
  }, [refreshToken]);

  return (
    <div className="panel">
      <h3>Captures</h3>
      <div style={{ maxHeight: 320, overflow: "auto" }}>
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(items, null, 2)}</pre>
      </div>
    </div>
  );
}
