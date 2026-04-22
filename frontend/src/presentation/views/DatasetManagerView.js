import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { DatasetRecordsManager } from "../components/dataset/DatasetRecordsManager";
import { DatasetStatsPanel } from "../components/dataset/DatasetStatsPanel";
export function DatasetManagerView() {
    const [refreshToken, setRefreshToken] = useState(0);
    return (_jsxs("div", { className: "grid", children: [_jsx(DatasetStatsPanel, { refreshToken: refreshToken }), _jsx(DatasetRecordsManager, { onChanged: () => setRefreshToken((v) => v + 1) })] }));
}
