import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import blogRoutes from "./routes/blogRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import authHandler from "./middleware/authHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  // Add more origins if needed
];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/users", authHandler, userRoutes);
app.use("/api/upload", authHandler, uploadRoutes);
app.use("/api/blogs", authHandler, blogRoutes);
app.use("/api/notifications", authHandler, notificationRoutes);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      dbHost: process.env.DB_HOST,
      dbName: process.env.DB_NAME,
      // Don't include sensitive info like passwords or JWT_SECRET
    },
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
