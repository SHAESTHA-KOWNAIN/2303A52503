import { Notification, NotificationType } from "./types.js";
import { fetchNotificationsFromProvider } from "./notificationApi.js";
import { logInfo, logError } from "./logger.js";

export interface PriorityNotificationResponse {
  notifications: Notification[];
  count: number;
}

function computePriority(notification: Notification): number {
  const typeWeight = notification.type === "Placement" ? 10 : notification.type === "Result" ? 7 : 4;
  const timestampValue = new Date(notification.timestamp).getTime();
  const ageHours = Math.max(0, (Date.now() - timestampValue) / 1000 / 60 / 60);
  const recencyBoost = Math.max(0, 24 - ageHours);
  return notification.priority + typeWeight + Math.floor(recencyBoost);
}

export async function getNotifications(
  token: string,
  limit?: number,
  page?: number,
  notification_type?: NotificationType,
): Promise<{ notifications: Notification[]; page: number; limit: number; total: number; totalPages: number; unreadCount: number }> {
  const actualLimit = Math.max(1, limit ?? 10);
  const actualPage = Math.max(1, page ?? 1);

  const notifications = await fetchNotificationsFromProvider(token, {
    limit: actualLimit,
    page: actualPage,
    notification_type,
  });

  const total = notifications.length;
  const totalPages = Math.max(1, Math.ceil(total / actualLimit));

  logInfo("Fetched notifications", {
    resultCount: total,
    page: actualPage,
    limit: actualLimit,
    notification_type: notification_type ?? "All",
  });

  return {
    notifications,
    page: actualPage,
    limit: actualLimit,
    total,
    totalPages,
    unreadCount: notifications.filter((item: Notification) => !item.isRead).length,
  };
}

export async function getPriorityNotifications(
  token: string,
  limit?: number,
  page?: number,
  notification_type?: NotificationType,
): Promise<PriorityNotificationResponse> {
  const notifications = await fetchNotificationsFromProvider(token, {
    limit: limit ?? 50,
    page: page ?? 1,
    notification_type,
  });

  const prioritized = [...notifications].map((item) => ({
    ...item,
    priority: computePriority(item),
  }));

  prioritized.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const top = prioritized.slice(0, limit ?? 10);

  logInfo("Computed priority notifications", {
    requestedLimit: limit ?? 10,
    count: top.length,
  });

  return {
    notifications: top,
    count: top.length,
  };
}
