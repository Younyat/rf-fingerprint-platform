import { ApiService } from "../../domain/services/ApiService";
export class InferenceController {
    constructor(api = new ApiService()) {
        this.api = api;
    }
    classify(payload) { return this.api.post("/inference/classify", payload); }
    verify(payload) { return this.api.post("/inference/verify", payload); }
}
