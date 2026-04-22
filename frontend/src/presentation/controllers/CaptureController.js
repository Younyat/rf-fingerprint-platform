import { ApiService } from "../../domain/services/ApiService";
export class CaptureController {
    constructor(api = new ApiService()) {
        this.api = api;
    }
    list() { return this.api.get("/captures"); }
    create(payload) { return this.api.post("/captures", payload); }
    start(payload) { return this.api.post("/captures/start", payload); }
    status(jobId) {
        const suffix = jobId ? `?job_id=${encodeURIComponent(jobId)}` : "";
        return this.api.get(`/captures/status${suffix}`);
    }
}
