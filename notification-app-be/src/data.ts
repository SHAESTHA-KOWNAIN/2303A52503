import fs from "fs";
import path from "path";
import { Notification } from "./types.js";

const dataPath = path.resolve(process.cwd(), "notification-app-be", "data", "notifications.json");

export function loadNotifications(): Notification[] {
  try {
    const raw = fs.readFileSync(dataPath, "utf-8");
    const parsed = JSON.parse(raw) as Notification[];
    return parsed;
  } catch (error) {
    return [];
  }
}

export function saveNotifications(notifications: Notification[]) {
  fs.writeFileSync(dataPath, JSON.stringify(notifications, null, 2), "utf-8");
}
