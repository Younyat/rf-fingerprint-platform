import { ApiService } from "../../domain/services/ApiService";
export class ModelController {
    constructor(api = new ApiService()) {
        this.api = api;
    }
    current() { return this.api.get("/models/current"); }
    byVersion(version) { return this.api.get(`/models/${version}`); }
}
