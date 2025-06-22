import BaseModel from "./BaseModel.js";
import db from "../config/db.js";

class UserModel extends BaseModel {
  constructor() {
    super("users");
  }

  // Add custom user-specific methods here
  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  async createUser(userData) {
    // Add any user-specific validation or data transformation here
    return this.create(userData);
  }
}

export default new UserModel();
