import "dotenv/config";
import { createServer } from "http";
import app from "./app.js";
import { initSocket } from "./config/socket.js";

const port = process.env.PORT || 5002;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("Environment:", process.env.NODE_ENV || "development");
  console.log("Socket.IO initialized");
});
