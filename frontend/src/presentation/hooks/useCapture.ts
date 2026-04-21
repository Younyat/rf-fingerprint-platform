import { useEffect, useState } from "react";
import { CaptureController } from "../controllers/CaptureController";

export function useCapture() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  useEffect(() => {
    const c = new CaptureController();
    c.list().then((r: any) => setItems(r)).catch((e) => setError(String(e)));
  }, []);
  return { items, error };
}
