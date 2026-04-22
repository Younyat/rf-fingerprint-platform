import { ApiService } from "../../domain/services/ApiService";

export class TrainingController {
  constructor(private api = new ApiService()) {}
  start(payload: unknown) { return this.api.post<any>("/training/start", payload); }
  retrain(payload: unknown) { return this.api.post<any>("/training/retrain", payload); }
  status(jobId?: string) {
    const suffix = jobId ? `?job_id=${encodeURIComponent(jobId)}` : "";
    return this.api.get<any>(`/training/status${suffix}`);
  }
  models() { return this.api.get<any[]>("/training/models"); }
  dashboard(localOutputDir?: string) {
    const suffix = localOutputDir ? `?local_output_dir=${encodeURIComponent(localOutputDir)}` : "";
    return this.api.get<any>(`/training/dashboard${suffix}`);
  }
}
