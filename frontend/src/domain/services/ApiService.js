import { API_BASE } from "../../shared/constants";
export class ApiService {
    async get(path) {
        const res = await fetch(`${API_BASE}${path}`);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`GET ${path} failed: ${res.status} ${text}`);
        }
        return (await res.json());
    }
    async post(path, body) {
        const res = await fetch(`${API_BASE}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`POST ${path} failed: ${res.status} ${text}`);
        }
        return (await res.json());
    }
}
