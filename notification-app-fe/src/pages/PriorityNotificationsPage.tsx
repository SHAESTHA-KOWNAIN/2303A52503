import React, { useState } from "react";
import { Box, Stack, CircularProgress, Alert, Pagination, Typography } from "@mui/material";
import NotificationCard from "../components/NotificationCard";
import { fetchPriorityNotifications } from "../services/api";
import { useEffect } from "react";

export default function PriorityPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPriorityNotifications({ limit, page })
      .then((data) => {
        setNotifications(data.notifications || []);
        setTotalPages(1);
      })
      .catch((err) => setError(err.message || String(err)))
      .finally(() => setLoading(false));
  }, [limit, page]);

  const handlePageChange = (_: any, newPage: number) => setPage(newPage);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Priority Notifications
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && <Alert severity="error">Failed to load priority notifications: {error}</Alert>}

      {!loading && !error && notifications.length === 0 && <Alert severity="info">No priority notifications</Alert>}

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((n: any) => (
            <NotificationCard key={n.id} notification={n} />
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
