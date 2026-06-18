import React from "react";
import { Card, CardContent, Typography, Chip, Stack, IconButton } from "@mui/material";
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

interface Props {
  notification: any;
  onMarkRead?: (id: string) => void;
}

export default function NotificationCard({ notification, onMarkRead }: Props) {
  const unread = !notification.isRead;
  return (
    <Card variant="outlined" sx={{ bgcolor: unread ? "#fff8e1" : undefined }}>
      <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack>
          <Typography variant="subtitle2">{notification.type}</Typography>
          <Typography variant="body1">{notification.message}</Typography>
          <Typography variant="caption" color="text.secondary">{new Date(notification.timestamp).toLocaleString()}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {unread && <Chip label="Unread" color="primary" size="small" />}
          <IconButton onClick={() => onMarkRead?.(notification.id)} aria-label="mark-read">
            <MarkEmailReadIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
