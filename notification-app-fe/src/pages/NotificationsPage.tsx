import React, { useState } from "react";
import { Box, Stack, CircularProgress, Alert, Pagination, Typography } from "@mui/material";
import NotificationFilter from "../components/NotificationFilter";
import NotificationCard from "../components/NotificationCard";
import { useNotifications } from "../hooks/useNotifications";
import { fetchNotifications } from "../services/api";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { notifications, totalPages, loading, error } = useNotifications(limit, page, filter);

  const handleFilterChange = (newFilter?: string) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handlePageChange = (_: any, newPage: number) => setPage(newPage);

  const markRead = async (id: string) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000'}/notifications/${id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN ?? ''}` },
      });
      // optimistically update UI
      // reload page
      window.location.reload();
    } catch (e) {
      // ignore
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>
      </Stack>

      <Box sx={{ marginBottom: 3 }}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && <Alert severity="error">Failed to load notifications: {error}</Alert>}

      {!loading && !error && notifications.length === 0 && <Alert severity="info">No notifications</Alert>}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((n: any) => (
            <NotificationCard key={n.id} notification={n} onMarkRead={markRead} />
          ))}
        </Stack>
      )}

      {!loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" shape="rounded" />
        </Box>
      )}
    </Box>
  );
}
