import { useEffect, useState } from "react";
import { CaptureController } from "../controllers/CaptureController";
export function useCapture() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");
    useEffect(() => {
        const c = new CaptureController();
        c.list().then((r) => setItems(r)).catch((e) => setError(String(e)));
    }, []);
    return { items, error };
}
