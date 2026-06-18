import { Log, LogLevel } from "../../logging-middleware/src/Log.js";

export interface LogMeta {
  [key: string]: unknown;
}

function formatMeta(meta?: LogMeta) {
  if (!meta || Object.keys(meta).length === 0) return "";
  return Object.entries(meta).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(" ");
}

function output(level: LogLevel, message: string, meta?: LogMeta) {
  const payload = formatMeta(meta);
  const composed = payload ? `${message} ${payload}` : message;

  // Use central Log API; fire-and-forget but avoid unhandled promise rejections
  void Log("backend", level, "notification-app-be", composed).catch(() => {
    // swallow logging errors to avoid affecting request flow
  });
}

export function logInfo(message: string, meta?: LogMeta) {
  output("info", message, meta);
}

export function logError(message: string, meta?: LogMeta) {
  output("error", message, meta);
}

export function requestLogger(req: any, res: any, next: any) {
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

export function errorLogger(error: any, req: any, res: any, next: any) {
  logError(error?.message || "Unknown error", {
    method: req?.method,
    path: req?.originalUrl || req?.url,
    status: res?.statusCode,
    stack: error?.stack,
  });
  next(error);
}
