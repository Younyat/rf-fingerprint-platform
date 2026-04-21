import { ApiService } from "../../domain/services/ApiService";
export class ValidationController {
    constructor(api = new ApiService()) {
        this.api = api;
    }
    run(payload) { return this.api.post("/validation/run", payload); }
    reports() { return this.api.get("/validation/reports"); }
}
