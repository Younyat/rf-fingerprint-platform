import { ApiService } from "../../domain/services/ApiService";

export class ModelController {
  constructor(private api = new ApiService()) {}
  current() { return this.api.get("/models/current"); }
  byVersion(version: string) { return this.api.get(`/models/${version}`); }
}
