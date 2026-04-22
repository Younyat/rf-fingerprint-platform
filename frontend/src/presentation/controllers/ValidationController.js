import { ApiService } from "../../domain/services/ApiService";
export class ValidationController {
    constructor(api = new ApiService()) {
        this.api = api;
    }
    run(payload) { return this.api.post("/validation/run", payload); }
    start(payload) { return this.api.post("/validation/start", payload); }
    status(jobId) {
        const suffix = jobId ? `?job_id=${encodeURIComponent(jobId)}` : "";
        return this.api.get(`/validation/status${suffix}`);
    }
    reports() { return this.api.get("/validation/reports"); }
}
