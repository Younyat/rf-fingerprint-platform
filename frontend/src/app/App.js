import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { AppRouter } from "./router";
import { AppProviders } from "./providers/AppProviders";
export function App() {
    return (_jsx(AppProviders, { children: _jsxs("main", { children: [_jsx("h1", { children: "RF Fingerprint Platform" }), _jsxs("nav", { style: { display: "flex", gap: 12, marginBottom: 16 }, children: [_jsx(Link, { to: "/", children: "Dashboard" }), _jsx(Link, { to: "/capture", children: "Capture" }), _jsx(Link, { to: "/dataset", children: "Dataset" }), _jsx(Link, { to: "/training", children: "Training" }), _jsx(Link, { to: "/retraining", children: "Retraining" }), _jsx(Link, { to: "/validation", children: "Validation" }), _jsx(Link, { to: "/inference", children: "Inference" }), _jsx(Link, { to: "/models", children: "Models" })] }), _jsx(AppRouter, {})] }) }));
}
