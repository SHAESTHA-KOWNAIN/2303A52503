import { Notification, NotificationType } from "./types.js";
import { logError, logInfo } from "./logger.js";

export interface NotificationApiQuery {
  limit?: number;
  page?: number;
  notification_type?: NotificationType;
}

export interface RawNotificationApiResponse {
  notifications: Array<{ ID: string; Type: NotificationType; Message: string; Timestamp: string }>;
}

const DEFAULT_PROVIDER_URL = "http://4.224.186.213/evaluation-service/notifications";

function buildQueryString(params: NotificationApiQuery): string {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }
  if (params.notification_type) {
    searchParams.set("notification_type", params.notification_type);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function fetchNotificationsFromProvider(
  token: string,
  query: NotificationApiQuery,
): Promise<Notification[]> {
  const baseUrl = process.env.NOTIFICATION_API_BASE_URL?.trim() || DEFAULT_PROVIDER_URL;
  const url = `${baseUrl}${buildQueryString(query)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const bodyText = await response.text();
      const errorMessage = `Notification API returned ${response.status}: ${bodyText}`;
      logError("Notification API fetch failed", { url, status: response.status, bodyText });
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as RawNotificationApiResponse;
    if (!data || !Array.isArray(data.notifications)) {
      logError("Invalid notification API response", { url, payload: data });
      throw new Error("Invalid notification API response");
    }

    return data.notifications.map((item) => ({
      id: item.ID,
      type: item.Type,
      message: item.Message,
      timestamp: item.Timestamp,
      isRead: false,
      priority: 0,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error fetching notification API";
    logError("Failed to fetch notifications from provider", { url, message });
    throw error;
  }
}
