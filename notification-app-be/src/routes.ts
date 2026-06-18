import { Router } from "express";
import { getNotifications, getPriorityNotifications } from "./notificationService.js";
import { logInfo, logError } from "./logger.js";

const router = Router();

function getBearerToken(req: any): string | null {
  const header = req.headers?.authorization;
  if (!header || typeof header !== "string") return null;
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}

router.get("/notifications", async (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing Authorization token" });
  }

  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const notification_type = req.query.notification_type as any;

  try {
    const payload = await getNotifications(token, limit, page, notification_type);
    return res.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logError("GET /notifications failed", { message, notification_type, limit, page });
    return res.status(502).json({ error: message });
  }
});

router.get("/priority-notifications", async (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing Authorization token" });
  }

  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const notification_type = req.query.notification_type as any;

  try {
    const payload = await getPriorityNotifications(token, limit, page, notification_type);
    return res.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logError("GET /priority-notifications failed", { message, notification_type, limit, page });
    return res.status(502).json({ error: message });
  }
});

export default router;
