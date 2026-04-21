import { ApiService } from "../../domain/services/ApiService";

export class ValidationController {
  constructor(private api = new ApiService()) {}
  run(payload: unknown) { return this.api.post("/validation/run", payload); }
  reports() { return this.api.get("/validation/reports"); }
}
