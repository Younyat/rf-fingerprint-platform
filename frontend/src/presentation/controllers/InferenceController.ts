import { ApiService } from "../../domain/services/ApiService";

export class InferenceController {
  constructor(private api = new ApiService()) {}
  classify(payload: unknown) { return this.api.post("/inference/classify", payload); }
  verify(payload: unknown) { return this.api.post("/inference/verify", payload); }
}
