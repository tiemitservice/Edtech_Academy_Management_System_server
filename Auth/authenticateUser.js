const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // DON'T use `.lean()` here

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // Attach full Mongoose document
    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authenticateUser;
