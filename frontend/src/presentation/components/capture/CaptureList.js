import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { CaptureController } from "../../controllers/CaptureController";
export function CaptureList({ refreshToken }) {
    const [items, setItems] = useState([]);
    useEffect(() => {
        new CaptureController().list().then((r) => setItems(Array.isArray(r) ? r : [])).catch(() => setItems([]));
    }, [refreshToken]);
    return (_jsxs("div", { className: "panel", children: [_jsx("h3", { children: "Captures" }), _jsx("div", { style: { maxHeight: 320, overflow: "auto" }, children: _jsx("pre", { style: { whiteSpace: "pre-wrap" }, children: JSON.stringify(items, null, 2) }) })] }));
}
