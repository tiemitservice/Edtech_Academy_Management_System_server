const nodemailer = require("nodemailer"); // Import nodemailer
const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { verifyToken, hashPassword, comparePassword } = require("./authHelper");

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, password, and role are required." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email is not valid." });
    }

    // Validate phoneNumber format if provided
    if (phoneNumber && !/^\d{9,15}$/.test(phoneNumber)) {
      return res
        .status(400)
        .json({ error: "Phone number must be between 9 and 15 digits." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    // Check for duplicate phoneNumber if provided
    if (phoneNumber) {
      const existingPhone = await User.findOne({ phoneNumber });
      if (existingPhone) {
        return res
          .status(400)
          .json({ error: "Phone number is already registered." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNumber: phoneNumber || undefined, // Set to undefined if not provided
    });

    const savedUser = await newUser.save();

    // Generate a token for the new user
    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email, role: savedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save the token to the database
    savedUser.token = token;
    await savedUser.save();

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        phoneNumber: savedUser.phoneNumber,
      },
      token,
    });
  } catch (err) {
    console.error("Registration error:", err.message || err);
    res.status(500).json({ error: "An error occurred during registration." });
  }
};

// create a new user

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, token } = req.body;
    const hashedPassword = await hashPassword(password);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
      token,
    });
    await user.save();
    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the user." });
  }
};

/**
 * Login user and generate JWT
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email is not valid." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        permissions: user.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Optionally save token
    user.token = token;
    await user.save();

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        token: user.token,
        image: user.image,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message || err);
    res.status(500).json({ error: "An error occurred during login." });
  }
};
const changePassword = async (req, res) => {
  const { token, currentPassword, newPassword } = req.body;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Incorrect current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Logout user
 */
const logout = (req, res) => {
  res.status(200).json({ message: "Logout successful." });
};

const sendResetEmail = async (email, name, resetToken) => {
  console.log("Reset token in sendResetEmail:", resetToken); // Log the token for debugging

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  console.log("Reset link:", resetLink); // Log the reset link for debugging

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
          <style>
              /* General Styles */
              body {
                  margin: 0;
                  padding: 0;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                  background-color: #f4f4f7;
              }
              .email-container {
                  max-width: 600px;
                  margin: 40px auto;
                  background-color: #ffffff;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                  border: 1px solid #e8e8e8;
              }
              .email-header {
                  background-color: #4A90E2; /* A nice, professional blue */
                  color: #ffffff;
                  padding: 30px;
                  text-align: center;
              }
              .email-header h1 {
                  margin: 0;
                  font-size: 28px;
                  font-weight: 600;
              }
              .email-body {
                  padding: 30px 40px;
                  font-size: 16px;
                  line-height: 1.6;
                  color: #333333;
              }
              .email-body p {
                  margin: 0 0 1em 0;
              }
              .cta-button {
                  display: block;
                  width: fit-content;
                  background-color: #4A90E2;
                  color: #ffffff;
                  text-decoration: none;
                  padding: 14px 28px;
                  border-radius: 8px;
                  font-weight: bold;
                  margin: 30px auto;
                  text-align: center;
                  font-size: 16px;
              }
              .email-footer {
                  background-color: #f4f4f7;
                  padding: 20px 40px;
                  text-align: center;
                  font-size: 12px;
                  color: #888888;
              }
              .email-footer p {
                  margin: 0 0 5px 0;
              }
              .content-block {
                  text-align: left;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="email-header">
                  <h1>Password Reset</h1>
              </div>
              <div class="email-body">
                  <div class="content-block">
                    
                      <p>We received a request to reset the password for your account. If you did not make this request, you can safely ignore this email.</p>
                      <p>To reset your password, please click the button below. This link will expire in 1 hour.</p>
                  </div>
                  <a href="\${resetLink}" class="cta-button">Reset Your Password</a>
                  <div class="content-block">
                      <p>If you're having trouble with the button, you can also copy and paste this link into your browser:</p>
                      // <p style="word-break: break-all; font-size: 12px; color: #555;"><a href="\${resetLink}" style="color: #4A90E2;">\${resetLink}</a></p>
                  </div>
              </div>
              <div class="email-footer">
                  <p>&copy; ${new Date().getFullYear()}  អ៊ែដធិច អាខាឌីមី ( ប៊ីធីប៊ី ). All rights reserved.</p>
                  <p>
                    Battambang Cambodia
                  </p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required." });
    }

    // Decode token (but don’t trust it alone)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by token hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      _id: decoded.id,
      resetToken: hashedToken,
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    // Hash and save new password
    user.password = await hashPassword(newPassword);
    user.resetToken = null; // clear token
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err.message || err);
    res
      .status(500)
      .json({ error: "An error occurred while resetting the password." });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    if (email) {
      // Only validate if email is provided
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Email is not valid." });
      }
    }
    // Find the user by email and update the reset token
    const user = await User.findOneAndUpdate(
      { email }, // Find the user by email
      { $set: { resetToken: null } }, // Clear any existing reset token
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    console.log("Generated reset token:", resetToken); // Log the generated token for debugging

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Update the user with the hashed token
    user.resetToken = hashedToken;
    await user.save();

    // Send the reset email
    await sendResetEmail(user.email, user.name, resetToken);

    res
      .status(200)
      .json({ message: "Password reset email sent successfully." });
  } catch (err) {
    console.error("Forget password error:", err.message || err);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
};

// delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("Delete user error:", err.message || err);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user." });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, phoneNumber, role, password } = req.body;
    const { id } = req.params;

    const updateFields = { name, email, phoneNumber, role };

    if (password) {
      updateFields.password = await hashPassword(password);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res
      .status(200)
      .json({ message: "User updated successfully.", user: updatedUser });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update user." });
  }
};

module.exports = {
  changePassword,
  register,
  login,
  logout,
  forgetPassword,
  resetPassword,
  sendResetEmail, // if used
  createUser,
  deleteUser,
  updateUser,
};
