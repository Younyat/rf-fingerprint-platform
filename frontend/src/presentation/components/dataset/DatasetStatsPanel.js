import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { DatasetController } from "../../controllers/DatasetController";
export function DatasetStatsPanel() {
    const [stats, setStats] = useState(null);
    useEffect(() => {
        new DatasetController().stats().then(setStats).catch(() => setStats(null));
    }, []);
    return (_jsxs("div", { className: "panel", children: [_jsx("h3", { children: "Dataset Stats" }), _jsx("pre", { style: { whiteSpace: "pre-wrap" }, children: JSON.stringify(stats, null, 2) })] }));
}
