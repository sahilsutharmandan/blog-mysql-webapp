import db from "../config/db.js";

async function checkIsUserLikedBlog(blogs, user) {
  if (!blogs.length) return blogs;

  const blogIds = blogs.map((blog) => blog.id);

  const placeholders = blogIds.map(() => "?").join(", ");
  // const query = `SELECT * FROM likes WHERE user_id =? AND`
  const [likes] = await db.query(
    `SELECT blog_id FROM likes WHERE user_id = ? AND type = 'post' AND sub_type = 'like' AND blog_id IN (${placeholders})`,
    [user.id, ...blogIds]
  );

  const likedBlogIds = new Set(likes.map((like) => like.blog_id));

  return blogs.map((blog) => ({
    ...blog,
    liked: likedBlogIds.has(blog.id) ? 1 : 0,
  }));
}
class BlogController {
  async createBlog(req, res) {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { title, description, images, tags, user_id = user.id } = req.body;
    try {
      const [result] = await db.query(
        "INSERT INTO blogs (title, description, images, tags, user_id) VALUES (?, ?, ?, ?, ?)",
        [title, description, images, tags, user_id]
      );
      res
        .status(201)
        .json({ message: "Blog created successfully", blog: result });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Blog creation failed", error: error.message });
    }
  }
  async getBlogs(req, res) {
    const user = req.user;

    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const [result] = await db.query(
        `SELECT blogs.*, u.name AS user_name,
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', c.id,
                'comment', c.comment,
                'user_name', c.user_name,
                'replies',
                  (
                    SELECT JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'id', r.id,
                        'reply', r.comment,
                        'user_name', r.user_name
                      )
                    )
                    FROM (
                      SELECT rc.id, rc.comment, ru.name AS user_name
                      FROM comments rc
                      JOIN users ru ON rc.user_id = ru.id
                      WHERE rc.parent_id = c.id
                      ORDER BY rc.created_at ASC
                    ) AS r
                  )
              )
            )
            FROM (
              SELECT comments.id, comments.comment, cu.name AS user_name
              FROM comments
              JOIN users cu ON comments.user_id = cu.id
              WHERE comments.blog_id = blogs.id AND comments.parent_id IS NULL
              ORDER BY comments.created_at DESC
              LIMIT 3
            ) AS c
          ) AS blog_comments
        FROM blogs
        JOIN users u ON blogs.user_id = u.id
        ORDER BY blogs.created_at DESC
        LIMIT ? OFFSET ?`,
        [Number(limit), Number(offset)]
      );

      let blogs = result;

      if (user) {
        blogs = await checkIsUserLikedBlog(blogs, user);
      }

      res.status(200).json({ message: "Blogs fetched successfully", blogs });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Blog fetching failed", error: error.message });
    }
  }

  async getBlogById(req, res) {
    const { id } = req.params;
    const query = `SELECT * FROM blogs WHERE id = ?`;
    const [result] = await db.query(query, [id]);
    if (result.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }
    const blog = result[0];
    blog.view_count++;
    await db.query("UPDATE blogs SET view_count = ? WHERE id = ?", [
      blog.view_count,
      id,
    ]);
    res.status(200).json({ message: "Blog fetched successfully", blog });
  }
}

export default new BlogController();
