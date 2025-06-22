import notificationEmitter from "../../emitters/notificationEmitter.js";
import db from "../config/db.js";

class LikeCommentController {
  async handleLikeDislike(req, res) {
    try {
      const { id } = req.params;
      const { type, sub_type } = req.query;
      const user = req.user;
      console.log(user, "user");
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const [existing] = await db.query(
        "SELECT * FROM likes WHERE blog_id = ? AND user_id = ? AND type = ?",
        [id, user.id, type]
      );
      if (existing?.length > 0) {
        const previous = existing[0];
        if (previous.sub_type === sub_type) {
          await db.query("DELETE FROM likes WHERE id = ?", [previous.id]);

          const likeChange = sub_type === "like" ? -1 : 0;
          await db.query(
            "UPDATE blogs SET like_count = like_count + ? WHERE id = ?",
            [likeChange, id]
          );

          return res
            .status(200)
            .json({ message: `${sub_type} removed`, liked: false });
        } else {
          await db.query(
            "UPDATE likes SET sub_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [sub_type, previous.id]
          );
          const likeChange = sub_type === "like" ? 1 : -1;
          await db.query(
            "UPDATE blogs SET like_count = like_count + ? WHERE id = ?",
            [likeChange, id]
          );

          return res.status(200).json({ message: `Switched to ${sub_type}` });
        }
      }
      await db.query(
        "INSERT INTO likes (blog_id, user_id, type, sub_type) VALUES (?, ?, ?, ?)",
        [id, user.id, type, sub_type]
      );
      const likeChange = sub_type === "like" ? 1 : 0;

      await db.query(
        "UPDATE blogs SET like_count = like_count + ? WHERE id = ?",
        [likeChange, id]
      );
      const [[blog]] = await db.query(
        "SELECT user_id FROM blogs WHERE id = ?",
        [id]
      );

      // Only emit notification for new likes and if the blog owner is different from the liker
      if (sub_type === "like" && blog && blog.user_id !== user.id) {
        console.log(
          "Emitting like notification for blog:",
          blog.user_id,
          "from user:",
          user.id
        );
        notificationEmitter.emit("sendNotification", {
          title: "New Like",
          message: `${user.name} liked your post`,
          image:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
          send_to: "user",
          user_id: blog.user_id,
        });
      }
      return res
        .status(200)
        .json({ message: `${sub_type} added`, liked: true });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async addComment(req, res) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { id } = req.params;
      const { parent_id, comment, is_reply, blog_id } = req.body;
      console.log(req.body, "boddyyyy");

      if (!comment || !blog_id) {
        return res
          .status(400)
          .json({ message: "Comment and blog id are required" });
      }

      const query = `INSERT INTO comments (parent_id, user_id, comment, is_reply,blog_id) VALUES (?, ?, ?, ?,?)`;

      const [result] = await db
        .query(query, [parent_id, user.id, comment, is_reply, blog_id])
        .catch((err) => {
          console.log(err, "err");
        });
      if (result.affectedRows === 0) {
        return res.status(400).json({ message: "Comment not added" });
      }
      console.log(result, "result");
      const blogQuery = `UPDATE blogs SET comment_count = comment_count + 1 WHERE id = ?`;
      if (blogQuery.affectedRows === 0) {
        return res.status(400).json({ message: "Blog not found" });
      }
      try {
        await db.query(blogQuery, [blog_id]);
        const [[blog]] = await db.query(
          "SELECT user_id FROM blogs WHERE id = ?",
          [blog_id]
        );
        console.log(blog, "blog");

        // Only emit notification if the blog owner is different from the commenter
        if (blog && blog.user_id !== user.id) {
          console.log(
            "Emitting comment notification for blog:",
            blog.user_id,
            "from user:",
            user.id
          );
          notificationEmitter.emit("sendNotification", {
            title: "New Comment",
            message: `${user.name} commented on your post`,
            image:
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
            send_to: "user",
            user_id: blog.user_id,
          });
        }
      } catch (error) {
        console.log(error, "error");
      }
      return res
        .status(200)
        .json({ message: "Comment added", comment: result });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async getComments(req, res) {
    try {
      const { id } = req.params;
      const [comments] = await db.query(
        "SELECT comments.*, users.name AS user_name, users.profile_picture AS user_profile_picture FROM comments LEFT JOIN users ON comments.user_id = users.id WHERE comments.blog_id = ?",
        [id]
      );
      return res.status(200).json({ comments });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new LikeCommentController();
