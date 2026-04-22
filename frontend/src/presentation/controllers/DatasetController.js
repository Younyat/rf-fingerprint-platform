import { ApiService } from "../../domain/services/ApiService";
export class DatasetController {
    constructor(api = new ApiService()) {
        this.api = api;
    }
    train() { return this.api.get("/datasets/train"); }
    val() { return this.api.get("/datasets/val"); }
    stats() { return this.api.get("/datasets/stats"); }
    deleteRecords(records) {
        return this.api.post("/datasets/delete", { records });
    }
}
