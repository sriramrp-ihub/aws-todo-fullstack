import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import todoRoutes from "./routes/todoRoutes";
import { metricsService } from "./services/metricsService";
import { metricsMiddleware } from "./middleware/metricsMiddleware";

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(metricsMiddleware);

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Todo App API",
    version: "1.0.0",
  });
});

app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", metricsService.register.contentType);
    const metrics = await metricsService.getMetrics();
    res.send(metrics);
  } catch (error) {
    res.status(500).send("Error generating metrics");
  }
});

app.use("/api/auth", authRoutes);

app.use("/api/todos", todoRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
