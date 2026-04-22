import { ApiService } from "../../domain/services/ApiService";
export class InferenceController {
    constructor(api = new ApiService()) {
        this.api = api;
    }
    classify(payload) { return this.api.post("/inference/classify", payload); }
    verify(payload) { return this.api.post("/inference/verify", payload); }
    listPredictionCaptures() { return this.api.get("/inference/predict/captures"); }
    startPrediction(payload) { return this.api.post("/inference/predict/start", payload); }
    predictionStatus(jobId) {
        const suffix = jobId ? `?job_id=${encodeURIComponent(jobId)}` : "";
        return this.api.get(`/inference/predict/status${suffix}`);
    }
}
