require("dotenv").config({ path: "./.env" }); // Ensure .env is loaded
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();

// CORS Configuration (Allow live frontend)
const corsOptions = {
    origin: ["http://localhost:3000", "https://sample-brookbytes.netlify.app"], // Local + Live Frontend
    methods: "GET,POST,PUT,DELETE",
    credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Root Route (Health Check)
app.get("/", (req, res) => {
    res.send("✅ Backend is running...");
});

// Email Sending Route
app.post("/send-email", async (req, res) => {
    const { name, email, phone, proposalPurpose, message } = req.body;

    if (!name || !email || !phone || !proposalPurpose || !message) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    // Nodemailer Transporter
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,  // Sender Email
            pass: process.env.EMAIL_PASS   // App Password from Google
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER, // Change to your receiver email
        subject: `New Contact Form Submission from ${name}`,
        html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Proposal Purpose:</strong> ${proposalPurpose}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent: " + info.response);
        res.json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("❌ Email sending failed:", error);
        res.status(500).json({ message: "Error sending email", error });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
