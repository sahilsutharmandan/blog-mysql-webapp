import notificationEmitter from "../../emitters/notificationEmitter.js";
import db from "../config/db.js";

class NotificationController {
  constructor() {
    // Bind the event handler with proper context
    this.handleNotificationEvent = this.handleNotificationEvent.bind(this);
    notificationEmitter.on("sendNotification", this.handleNotificationEvent);
    console.log("NotificationController initialized and listening for events");
  }

  // Event handler for notifications from emitter
  async handleNotificationEvent(notificationData) {
    try {
      const {
        title,
        message,
        image,
        send_to = "user",
        user_id,
      } = notificationData;

      if (!title || !message || !user_id) {
        console.error("Missing required notification data:", {
          title,
          message,
          user_id,
        });
        // return;
      }

      const query = `INSERT INTO notifications (title, message, image, send_to, user_id) VALUES (?, ?, ?, ?, ?)`;
      const [result] = await db.query(query, [
        title,
        message,
        image,
        send_to,
        user_id,
      ]);

      console.log("Notification created via event:", result);
      return result;
    } catch (error) {
      console.error("Error creating notification via event:", error);
      throw error;
    }
  }

  // Route handler for manual notification creation
  async createNotification(req, res) {
    try {
      const user = req.user;
      const { title, message, image, send_to, user_id } = req.body;

      if (user.id === user_id) {
        return res
          .status(400)
          .json({ message: "You cannot send notification to yourself" });
      }

      const query = `INSERT INTO notifications (title, message, image, send_to, user_id) VALUES (?, ?, ?, ?, ?)`;
      const [result] = await db.query(query, [
        title,
        message,
        image,
        send_to,
        user_id,
      ]);

      return res
        .status(200)
        .json({ message: "Notification created", notification: result });
    } catch (error) {
      console.error("Error creating notification:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  async getNotifications(req, res) {
    try {
      const user = req.user;
      const { send_to = "all" } = req.query;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const query = `SELECT * FROM notifications WHERE  send_to = ? OR user_id = ? ORDER BY created_at DESC`;
      const [result] = await db.query(query, [send_to, user.id]);
      const [[unreadCount]] = await db.query(
        `SELECT COUNT(*) AS unread_count FROM notifications WHERE is_read = 0 AND (send_to = ? OR user_id =?)`,
        [send_to, user.id]
      );
      // console.log(unreadCount, "unreadCount");
      return res.status(200).json({
        message: "Notifications fetched",
        notifications: result,
        unread_count: unreadCount.unread_count,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new NotificationController();
