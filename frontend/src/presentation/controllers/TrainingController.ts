import { ApiService } from "../../domain/services/ApiService";

export class TrainingController {
  constructor(private api = new ApiService()) {}
  start(payload: unknown) { return this.api.post("/training/start", payload); }
  retrain(payload: unknown) { return this.api.post("/training/retrain", payload); }
  status() { return this.api.get("/training/status"); }
  models() { return this.api.get("/training/models"); }
}
