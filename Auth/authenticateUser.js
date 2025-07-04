const jwt = require("jsonwebtoken");
const User = require("../Models/User"); // Adjust path as needed

const authenticateUser = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id; // support both `userId` or `id`

    // Fetch user from DB and remove sensitive fields
    const user = await User.findById(userId).lean(); // lean() gives plain object
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Destructure and remove sensitive fields
    const { password, resetToken, token: jwtToken, ...safeUser } = user;

    // Attach sanitized user to the request
    req.user = safeUser;

    // Continue to next middleware
    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authenticateUser;
