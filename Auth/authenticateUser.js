const jwt = require("jsonwebtoken");
const User = require("../Models/User"); // Assuming you have a User model

// Middleware to verify JWT token and fetch the user
const authenticateUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", ""); // Get token from header

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your secret key

    // Fetch the user from the database using the decoded userId
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Attach the user to the request object for use in subsequent middleware or routes
    req.user = user;

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authenticateUser;
