import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Container, AppBar, Toolbar, Typography, Button } from "@mui/material";
import NotificationsPage from "./pages/NotificationsPage";
import PriorityPage from "./pages/PriorityNotificationsPage";

export default function App() {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Notifications
          </Typography>
          <Button color="inherit" component={Link} to="/">
            All
          </Button>
          <Button color="inherit" component={Link} to="/priority">
            Priority
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Routes>
          <Route path="/" element={<NotificationsPage />} />
          <Route path="/priority" element={<PriorityPage />} />
        </Routes>
      </Container>
    </div>
  );
}
