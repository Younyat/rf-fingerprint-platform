import { ApiService } from "../../domain/services/ApiService";

export class CaptureController {
  constructor(private api = new ApiService()) {}
  list() { return this.api.get("/captures"); }
  create(payload: unknown) { return this.api.post("/captures", payload); }
  start(payload: unknown) { return this.api.post<any>("/captures/start", payload); }
  status(jobId?: string) {
    const suffix = jobId ? `?job_id=${encodeURIComponent(jobId)}` : "";
    return this.api.get<any>(`/captures/status${suffix}`);
  }
}
