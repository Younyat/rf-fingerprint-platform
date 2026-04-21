import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { CaptureForm } from "../components/capture/CaptureForm";
import { CaptureList } from "../components/capture/CaptureList";
export function CaptureLabView() {
    const [refreshToken, setRefreshToken] = useState(0);
    return (_jsxs("div", { className: "grid grid-2", children: [_jsx(CaptureForm, { onCreated: () => setRefreshToken((v) => v + 1) }), _jsx(CaptureList, { refreshToken: refreshToken })] }));
}
