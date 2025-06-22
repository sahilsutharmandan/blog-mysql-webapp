import { EventEmitter } from "events";
import { emitNotification } from "../src/config/socket.js";

const notificationEmitter = new EventEmitter();

// Handle notification events and emit via Socket.IO
notificationEmitter.on("new_notification", (data) => {
  console.log("New notification event:", data);
  // Emit to specific user via Socket.IO
  emitNotification(data.userId, data);
});

export default notificationEmitter;
