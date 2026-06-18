function formatMeta(meta) {
    if (!meta || Object.keys(meta).length === 0) {
        return "";
    }
    return Object.entries(meta)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(" ");
}
function output(level, message, meta) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    const payload = formatMeta(meta);
    if (payload) {
        if (level === "error") {
            console.error(`${formatted} ${payload}`);
        }
        else if (level === "warn") {
            console.warn(`${formatted} ${payload}`);
        }
        else {
            console.log(`${formatted} ${payload}`);
        }
    }
    else {
        if (level === "error") {
            console.error(formatted);
        }
        else if (level === "warn") {
            console.warn(formatted);
        }
        else {
            console.log(formatted);
        }
    }
}
export function logDebug(message, meta) {
    output("debug", message, meta);
}
export function logInfo(message, meta) {
    output("info", message, meta);
}
export function logWarn(message, meta) {
    output("warn", message, meta);
}
export function logError(message, meta) {
    output("error", message, meta);
}
export function requestLogger(req, res, next) {
    const start = Date.now();
    res.on("finish", () => {
        logInfo("HTTP request completed", {
            method: req.method,
            path: req.originalUrl || req.url,
            status: res.statusCode,
            durationMs: Date.now() - start,
        });
    });
    next();
}
export function errorLogger(error, req, res, next) {
    logError(error?.message || "Unknown error", {
        method: req?.method,
        path: req?.originalUrl || req?.url,
        status: res?.statusCode,
        stack: error?.stack,
    });
    next(error);
}
export function createClientLogger(context) {
    return {
        info: (message, meta) => output("info", `${context}: ${message}`, meta),
        warn: (message, meta) => output("warn", `${context}: ${message}`, meta),
        error: (message, meta) => output("error", `${context}: ${message}`, meta),
    };
}
