import express from "express";
import cors from "cors";
import router from "./routes.js";
import { requestLogger, errorLogger, logInfo } from "./logger.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(router);
app.use(errorLogger);

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Notification service is running" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  logInfo(`Notification backend listening on http://localhost:${port}`);
});
