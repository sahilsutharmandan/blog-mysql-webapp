import express from "express";
import BlogController from "../controllers/BlogController.js";
import likeCommentController from "../controllers/likeCommentController.js";

const router = express.Router();

router.post("/", BlogController.createBlog);
router.get("/", BlogController.getBlogs);
router.get("/like-dislike/:id", likeCommentController.handleLikeDislike);
router.post("/comment/:id", likeCommentController.addComment);
router.get("/comments/:id", likeCommentController.getComments);

export default router;
