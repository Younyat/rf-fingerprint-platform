import { ApiService } from "../../domain/services/ApiService";
export class TrainingController {
    constructor(api = new ApiService()) {
        this.api = api;
    }
    start(payload) { return this.api.post("/training/start", payload); }
    retrain(payload) { return this.api.post("/training/retrain", payload); }
    status(jobId) {
        const suffix = jobId ? `?job_id=${encodeURIComponent(jobId)}` : "";
        return this.api.get(`/training/status${suffix}`);
    }
    models() { return this.api.get("/training/models"); }
    dashboard(localOutputDir) {
        const suffix = localOutputDir ? `?local_output_dir=${encodeURIComponent(localOutputDir)}` : "";
        return this.api.get(`/training/dashboard${suffix}`);
    }
}
