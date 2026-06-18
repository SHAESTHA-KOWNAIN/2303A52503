export type NotificationType = "Placement" | "Result" | "Event";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: number;
}

export interface NotificationQueryParams {
  limit?: number;
  page?: number;
  notification_type?: NotificationType;
}
