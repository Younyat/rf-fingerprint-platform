import { ApiService } from "../../domain/services/ApiService";

export class DatasetController {
  constructor(private api = new ApiService()) {}
  train() { return this.api.get("/datasets/train"); }
  val() { return this.api.get("/datasets/val"); }
  stats() { return this.api.get("/datasets/stats"); }
}
