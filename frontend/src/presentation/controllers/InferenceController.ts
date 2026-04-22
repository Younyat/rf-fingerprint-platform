import { ApiService } from "../../domain/services/ApiService";

export class InferenceController {
  constructor(private api = new ApiService()) {}
  classify(payload: unknown) { return this.api.post("/inference/classify", payload); }
  verify(payload: unknown) { return this.api.post("/inference/verify", payload); }
  listPredictionCaptures() { return this.api.get<any[]>("/inference/predict/captures"); }
  startPrediction(payload: unknown) { return this.api.post<any>("/inference/predict/start", payload); }
  predictionStatus(jobId?: string) {
    const suffix = jobId ? `?job_id=${encodeURIComponent(jobId)}` : "";
    return this.api.get<any>(`/inference/predict/status${suffix}`);
  }
}
