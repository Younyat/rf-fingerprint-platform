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
  return (
    <Routes>
      <Route path="/" element={<DashboardView />} />
      <Route path="/capture" element={<CaptureLabView />} />
      <Route path="/dataset" element={<DatasetManagerView />} />
      <Route path="/training" element={<TrainingLabView />} />
      <Route path="/retraining" element={<RetrainingLabView />} />
      <Route path="/validation" element={<ValidationLabView />} />
      <Route path="/inference" element={<InferenceLabView />} />
      <Route path="/models" element={<ModelRegistryView />} />
    </Routes>
  );
}
