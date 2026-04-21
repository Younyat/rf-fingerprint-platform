import { jsx as _jsx } from "react/jsx-runtime";
import { DatasetStatsPanel } from "../components/dataset/DatasetStatsPanel";
export function DatasetManagerView() {
    return (_jsx("div", { className: "grid", children: _jsx(DatasetStatsPanel, {}) }));
}
