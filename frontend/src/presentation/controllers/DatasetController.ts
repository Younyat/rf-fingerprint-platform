import { ApiService } from "../../domain/services/ApiService";

export class DatasetController {
  constructor(private api = new ApiService()) {}
  train() { return this.api.get<any[]>("/datasets/train"); }
  val() { return this.api.get<any[]>("/datasets/val"); }
  stats() { return this.api.get<any>("/datasets/stats"); }
  deleteRecords(records: Array<{ metadata_path: string; cfile_path?: string; split?: string; emitter_device_id?: string; session_id?: string }>) {
    return this.api.post<any>("/datasets/delete", { records });
  }
}
