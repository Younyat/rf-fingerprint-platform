import { ApiService } from "../../domain/services/ApiService";

export class CaptureController {
  constructor(private api = new ApiService()) {}
  list() { return this.api.get("/captures"); }
  create(payload: unknown) { return this.api.post("/captures", payload); }
}
