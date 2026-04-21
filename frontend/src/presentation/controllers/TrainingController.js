import { ApiService } from "../../domain/services/ApiService";
export class TrainingController {
    constructor(api = new ApiService()) {
        this.api = api;
    }
    start(payload) { return this.api.post("/training/start", payload); }
    retrain(payload) { return this.api.post("/training/retrain", payload); }
    status() { return this.api.get("/training/status"); }
    models() { return this.api.get("/training/models"); }
}
