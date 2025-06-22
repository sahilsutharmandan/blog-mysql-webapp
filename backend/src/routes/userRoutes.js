import express from "express";
import UserController from "../controllers/UserController.js";

const router = express.Router();

// User routes
router.get("/", UserController.getAllUsers);
router.get("/login", UserController.loginUser);
router.get("/user-details", UserController.getUser);
router.post("/", UserController.createUser);
router.get("/:id", UserController.getUserById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

// Login route
router.post("/login", UserController.loginUser);

export default router;
