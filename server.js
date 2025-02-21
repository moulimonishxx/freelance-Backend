require('dotenv').config({ path: './.env' }); // Ensure .env is loaded
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(bodyParser.json());

// Email Sending Route
app.post('/send-email', async (req, res) => {
    const { name, email, phone, proposalPurpose, message } = req.body;

    if (!name || !email || !phone || !proposalPurpose || !message) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    // Nodemailer Transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,  // Your email
            pass: process.env.EMAIL_PASS   // Your email app password (App Password from Google)
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER, // Change to your receiver email
        subject: `New Contact Form Submission from ${name}`,
        text: `
            Name: ${name}
            Email: ${email}
            Phone: ${phone}
            Proposal Purpose: ${proposalPurpose}
            Message: ${message}
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent: " + info.response);
        res.json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error("❌ Email sending failed:", error);
        res.status(500).json({ message: 'Error sending email', error });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
