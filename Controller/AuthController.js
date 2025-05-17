const nodemailer = require("nodemailer"); // Import nodemailer
const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { verifyToken, hashPassword } = require('./authHelper');

/**
 * Register a new user
 */
const register = async (req, res) => {
    try {
        const { name, email, password, role, phoneNumber } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "Name, email, password, and role are required." });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Email is not valid." });
        }

        // Validate phoneNumber format if provided
        if (phoneNumber && !/^\d{9,15}$/.test(phoneNumber)) {
            return res.status(400).json({ error: "Phone number must be between 9 and 15 digits." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered." });
        }

        // Check for duplicate phoneNumber if provided
        if (phoneNumber) {
            const existingPhone = await User.findOne({ phoneNumber });
            if (existingPhone) {
                return res.status(400).json({ error: "Phone number is already registered." });
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
        const { name, email, password, role, phoneNumber } = req.body;
        const hashedPassword = await hashPassword(password);
        const user = new User({ name, email, password: hashedPassword, role, phoneNumber });
        await user.save();
        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'An error occurred while creating the user.' });
    }
};

/**
 * Login user and generate JWT
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }
        // validate if type not an email
        if (email) { // Only validate if email is provided
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: "Email is not valid." });
            }
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Generate a new token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Save the token to the database
        user.token = token;
        await user.save();

        console.log('Generated Token:', token);

        res.status(200).json({
            message: "Login successful.",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error("Login error:", err.message || err);
        res.status(500).json({ error: "An error occurred during login." });
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
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background-color: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 1.5rem;
        }
        form {
            display: flex;
            flex-direction: column;
        }
        label {
            margin-bottom: 0.5rem;
            color: #555;
        }
        input[type="email"] {
            padding: 0.75rem;
            margin-bottom: 1rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
        }
        button {
            background-color: #3498db;
            color: white;
            padding: 0.75rem;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        button:hover {
            background-color: #2980b9;
        }
        .message {
            margin-top: 1rem;
            text-align: center;
            color: #555;
        }
        .reset-link {
            display: inline-block;
            background-color: #3498db;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 1rem;
        }
        @media (max-width: 480px) {
            .container {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Password Reset</h1>

        <div class="message">
            <p>Hello ${name},</p>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <a href="${resetLink}" class="reset-link">Reset Password</a>
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
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required.' });
        }
        const decoded = await verifyToken(token);
        if (!decoded) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.resetToken !== crypto.createHash('sha256').update(token).digest('hex')) {
            return res.status(400).json({ error: 'Invalid or expired token.' });
        }
        const hashedPassword = await hashPassword(newPassword);

        user.password = hashedPassword;
        user.resetToken = null; // Clear the reset token
        await user.save();

        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (err) {
        console.error('Reset password error:', err.message || err);
        res.status(500).json({ error: 'An error occurred while resetting the password.' });
    }
};


const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }
        if (email) { // Only validate if email is provided
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
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        console.log("Generated reset token:", resetToken); // Log the generated token for debugging

        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        // Update the user with the hashed token
        user.resetToken = hashedToken;
        await user.save();

        // Send the reset email
        await sendResetEmail(user.email, user.name, resetToken);

        res.status(200).json({ message: "Password reset email sent successfully." });

    } catch (err) {
        console.error("Forget password error:", err.message || err);
        res.status(500).json({ error: "An error occurred while processing the request." });
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
        res.status(500).json({ error: "An error occurred while deleting the user." });
    }
};


module.exports = { register, login, logout, forgetPassword, resetPassword, sendResetEmail, createUser, deleteUser };
