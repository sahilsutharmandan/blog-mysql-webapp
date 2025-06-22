import jwt from "jsonwebtoken";

// Generate a secure random secret key
const generateSecretKey = () => {
  return require("crypto").randomBytes(64).toString("hex");
};

// Use environment variable if available, otherwise generate a new one
const JWT_SECRET = process.env.JWT_SECRET || generateSecretKey();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// JWT token generation
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// JWT token verification
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

export default {
  generateToken,
  verifyToken,
  authenticateToken,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
