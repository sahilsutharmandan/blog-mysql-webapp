import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
class UserController {
  async getAllUsers(req, res) {
    try {
      const [users] = await db.query("SELECT * FROM users");
      res.status(200).json({ message: "users fetched successfully", users });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  async getUserById(req, res) {
    try {
      const [users] = await db.query("SELECT * FROM users WHERE id = ?", [
        req.params.id,
      ]);
      const user = users[0];

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  async createUser(req, res) {
    try {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      // Basic validation
      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ error: "Name, email and password are required" });
      }

      // Check if user already exists
      const [existingUsers] = await db.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );
      if (existingUsers.length > 0) {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }

      // Insert new user
      const [result] = await db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword]
      );

      res.status(201).json({
        id: result.insertId,
        message: "User created successfully",
        user: { name, email },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  }

  async updateUser(req, res) {
    try {
      const { name, email, password } = req.body;
      const userId = req.params.id;

      // Check if user exists
      const [existingUsers] = await db.query(
        "SELECT id FROM users WHERE id = ?",
        [userId]
      );
      if (existingUsers.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Build update query dynamically based on provided fields
      const updates = [];
      const values = [];

      if (name) {
        updates.push("name = ?");
        values.push(name);
      }
      if (email) {
        updates.push("email = ?");
        values.push(email);
      }
      if (password) {
        updates.push("password = ?");
        values.push(password); // In production, password should be hashed
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      values.push(userId);
      const [result] = await db.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values
      );

      res.json({
        message: "User updated successfully",
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  }

  async deleteUser(req, res) {
    try {
      const [result] = await db.query("DELETE FROM users WHERE id = ?", [
        req.params.id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "User deleted successfully",
        affectedRows: result.affectedRows,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }

  // Additional utility methods
  async getUserByEmail(email) {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return users[0];
  }

  async searchUsers(query) {
    const searchQuery = `%${query}%`;
    const [users] = await db.query(
      "SELECT * FROM users WHERE name LIKE ? OR email LIKE ?",
      [searchQuery, searchQuery]
    );
    return users;
  }
  async getUser(req, res) {
    try {
      const user = req.user;

      res.status(200).json({ status: "ok", user });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  }
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }
      const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      const user = users[0];
      if (!user) {
        return res.status(401).json({ error: "no user found" });
      }
      // In production, use bcrypt to compare hashed passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      // Return user info (omit password)
      const { password: _, ...userInfo } = user;
      const token = jwt.sign(userInfo, process.env.JWT_SECRET);
      res.status(200).json({
        status: "ok",
        message: "Login successful",
        user: userInfo,
        token,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  }
}

export default new UserController();
