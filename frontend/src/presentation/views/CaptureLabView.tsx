import { useState } from "react";
import { CaptureForm } from "../components/capture/CaptureForm";
import { CaptureList } from "../components/capture/CaptureList";

export function CaptureLabView() {
  const [refreshToken, setRefreshToken] = useState(0);
  return (
    <div className="grid grid-2">
      <CaptureForm onCreated={() => setRefreshToken((v) => v + 1)} />
      <CaptureList refreshToken={refreshToken} />
    </div>
  );
}
