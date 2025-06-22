import express from "express";
import notificationController from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", notificationController.getNotifications);

router.post("/", notificationController.createNotification);

export default router;
