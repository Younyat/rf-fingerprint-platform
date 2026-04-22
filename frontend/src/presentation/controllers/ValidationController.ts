import { ApiService } from "../../domain/services/ApiService";

export class ValidationController {
  constructor(private api = new ApiService()) {}
  run(payload: unknown) { return this.api.post("/validation/run", payload); }
  start(payload: unknown) { return this.api.post<any>("/validation/start", payload); }
  status(jobId?: string) {
    const suffix = jobId ? `?job_id=${encodeURIComponent(jobId)}` : "";
    return this.api.get<any>(`/validation/status${suffix}`);
  }
  reports() { return this.api.get("/validation/reports"); }
}
