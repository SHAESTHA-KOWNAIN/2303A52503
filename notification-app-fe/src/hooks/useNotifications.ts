import { useState, useEffect } from "react";
import { fetchNotifications } from "../services/api";

export function useNotifications(limit = 10, page = 1, notification_type?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchNotifications({ limit, page, notification_type })
      .then((data) => {
        if (cancelled) return;
        setNotifications(data.notifications || []);
        setTotal(data.total || data.notifications.length || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [limit, page, notification_type]);

  return { notifications, total, totalPages, loading, error };
}
