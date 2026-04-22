import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Routes } from "react-router-dom";
import { DashboardView } from "../presentation/views/DashboardView";
import { CaptureLabView } from "../presentation/views/CaptureLabView";
import { DatasetManagerView } from "../presentation/views/DatasetManagerView";
import { TrainingLabView } from "../presentation/views/TrainingLabView";
import { RetrainingLabView } from "../presentation/views/RetrainingLabView";
import { ValidationLabView } from "../presentation/views/ValidationLabView";
import { InferenceLabView } from "../presentation/views/InferenceLabView";
import { ModelRegistryView } from "../presentation/views/ModelRegistryView";
export function AppRouter() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(DashboardView, {}) }), _jsx(Route, { path: "/capture", element: _jsx(CaptureLabView, {}) }), _jsx(Route, { path: "/dataset", element: _jsx(DatasetManagerView, {}) }), _jsx(Route, { path: "/training", element: _jsx(TrainingLabView, {}) }), _jsx(Route, { path: "/retraining", element: _jsx(RetrainingLabView, {}) }), _jsx(Route, { path: "/validation", element: _jsx(ValidationLabView, {}) }), _jsx(Route, { path: "/inference", element: _jsx(InferenceLabView, {}) }), _jsx(Route, { path: "/models", element: _jsx(ModelRegistryView, {}) })] }));
}
