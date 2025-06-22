import jwt from "jsonwebtoken";

const authHandler = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    next();
  } else {
    try {
      const decoded = jwt.verify(
        token.replace("Bearer ", ""),
        process.env.JWT_SECRET
      );

      if (!decoded) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  }
};

export default authHandler;
