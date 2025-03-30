const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

// Create a transporter using your email service credentials
const transporter = nodemailer.createTransport({
    service: 'gmail', // Change this if you're not using Gmail
    auth: {
        user: process.env.EMAIL_USER, // Your email address from .env
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password from .env
    },
});

// Function to send emails
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Online Store" <${process.env.EMAIL_USER}>`, // Sender address
            to, // Recipient address
            subject, // Email subject
            text, // Plain text body
            html, // HTML body (optional)
        });

        console.log('Email sent:', info.response);
        return info;
    } catch (err) {
        console.error('Error sending email:', err.message || err);
        throw err;
    }
};

module.exports = sendEmail;
