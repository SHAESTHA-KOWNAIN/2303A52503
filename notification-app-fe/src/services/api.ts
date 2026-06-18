import { Log, LogLevel } from "../../logging-middleware/src/Log.js";

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:4000";
const API_TOKEN = import.meta.env.VITE_API_TOKEN ?? "";

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  try {
    void Log("frontend", level, "notification-app-fe", `${message} ${meta ? JSON.stringify(meta) : ""}`);
  } catch (e) {
    // ignore
  }
}

export async function fetchNotifications(params: { limit?: number; page?: number; notification_type?: string }) {
  const qs = new URLSearchParams();
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.page) qs.set("page", String(params.page));
  if (params.notification_type) qs.set("notification_type", params.notification_type);

  const url = `${BACKEND_BASE}/notifications${qs.toString() ? `?${qs.toString()}` : ""}`;
  log("debug", "Fetching notifications", { url });

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });

  if (!res.ok) {
    const text = await res.text();
    log("error", "Failed fetching notifications", { status: res.status, text });
    throw new Error(text || `Status ${res.status}`);
  }

  const data = await res.json();
  log("info", "Fetched notifications", { count: (data.notifications || []).length });
  return data;
}

export async function fetchPriorityNotifications(params: { limit?: number; page?: number; notification_type?: string }) {
  const qs = new URLSearchParams();
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.page) qs.set("page", String(params.page));
  if (params.notification_type) qs.set("notification_type", params.notification_type);

  const url = `${BACKEND_BASE}/priority-notifications${qs.toString() ? `?${qs.toString()}` : ""}`;
  log("debug", "Fetching priority notifications", { url });

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });

  if (!res.ok) {
    const text = await res.text();
    log("error", "Failed fetching priority notifications", { status: res.status, text });
    throw new Error(text || `Status ${res.status}`);
  }

  const data = await res.json();
  log("info", "Fetched priority notifications", { count: (data.notifications || []).length });
  return data;
}
