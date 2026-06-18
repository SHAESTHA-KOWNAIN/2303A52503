export type LogLevel = "debug" | "info" | "warn" | "error";
export interface LogMeta {
  [key: string]: unknown;
}

function formatMeta(meta?: LogMeta) {
  if (!meta || Object.keys(meta).length === 0) {
    return "";
  }

  return Object.entries(meta)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(" ");
}

function output(level: LogLevel, message: string, meta?: LogMeta) {
  const timestamp = new Date().toISOString();
  const formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  const payload = formatMeta(meta);

  if (payload) {
    if (level === "error") {
      console.error(`${formatted} ${payload}`);
    } else if (level === "warn") {
      console.warn(`${formatted} ${payload}`);
    } else {
      console.log(`${formatted} ${payload}`);
    }
  } else {
    if (level === "error") {
      console.error(formatted);
    } else if (level === "warn") {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }
}

export function logDebug(message: string, meta?: LogMeta) {
  output("debug", message, meta);
}

export function logInfo(message: string, meta?: LogMeta) {
  output("info", message, meta);
}

export function logWarn(message: string, meta?: LogMeta) {
  output("warn", message, meta);
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

export function createClientLogger(context: string) {
  return {
    info: (message: string, meta?: LogMeta) =>
      output("info", `${context}: ${message}`, meta),
    warn: (message: string, meta?: LogMeta) =>
      output("warn", `${context}: ${message}`, meta),
    error: (message: string, meta?: LogMeta) =>
      output("error", `${context}: ${message}`, meta),
  };
}
