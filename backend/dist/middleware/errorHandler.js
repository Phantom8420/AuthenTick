import { ZodError } from "zod";
export function errorHandler(err, _req, res, _next) {
    if (err instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: err.flatten() });
    }
    const message = err instanceof Error ? err.message : "Internal error";
    const status = err.status ?? 500;
    return res.status(status).json({ error: message });
}
//# sourceMappingURL=errorHandler.js.map