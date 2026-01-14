require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// 1. CORS FIX - Isse browser kabhi block nahi karega
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '50mb' }));

// 2. MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

let otpStore = {}; 

/**
 * 3. SEND OTP (The "No-Timeout" Trick)
 */
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[normalizedEmail] = otp;

  console.log(`📨 Received request for: ${normalizedEmail}`);

  // Turant frontend ko response bhej do taaki 502/CORS error na aaye
  res.status(200).json({ success: true, message: "Processing email..." });

  // Email bhejte raho background mein (Wait mat karo)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: 'pixelnodeofficial@gmail.com',
      pass: 'wnux dvib bgsw rllg' 
    },
    tls: { rejectUnauthorized: false }
  });

  transporter.sendMail({
    from: '"Productr App" <pixelnodeofficial@gmail.com>',
    to: normalizedEmail,
    subject: 'Verification Code',
    text: `Your OTP is: ${otp}`
  }).then(info => {
    console.log("✅ Background Email Sent:", info.response);
  }).catch(err => {
    console.error("❌ Background Email Failed:", err.message);
  });
});

// 4. VERIFY OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();

  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail];
    return res.status(200).json({ success: true });
  }
  return res.status(400).json({ success: false, error: "Invalid OTP" });
});

// Health check
app.get('/health', (req, res) => res.status(200).send("OK"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server Live on Port ${PORT}`));