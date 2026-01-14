require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// 1. CORS Setup - Sabhi origins allow kar diye taaki browser error na de
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '50mb' }));

// 2. MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

let otpStore = {}; 

// 3. SEND OTP ROUTE
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[normalizedEmail] = otp;

  console.log(`📨 Requesting OTP for: ${normalizedEmail}`);

  /**
   * 🚩 IMPORTANT: Render Fix
   * Port 587 aur secure: false hi Render par chalta hai.
   */
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS ke liye false zaroori hai
    auth: {
      user: 'pixelnodeofficial@gmail.com',
      pass: 'wnux dvib bgsw rllg' 
    },
    tls: {
      rejectUnauthorized: false // Connection drop hone se bachata hai
    }
  });

  try {
    // 10 second ka timeout limit lagana taaki server hang na ho
    await transporter.sendMail({
      from: '"Productr App" <pixelnodeofficial@gmail.com>',
      to: normalizedEmail,
      subject: 'Login OTP Verification',
      text: `Your verification code is: ${otp}`
    });
    
    console.log(`✅ Success: OTP sent to ${normalizedEmail}`);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error.message);
    return res.status(500).json({ 
      success: false, 
      error: "Connection timeout - Gmail port 587 test failed", 
      details: error.message 
    });
  }
});

// 4. VERIFY OTP ROUTE
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();

  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail];
    return res.status(200).json({ success: true });
  }
  return res.status(400).json({ success: false, error: "Invalid OTP" });
});

// Health check for Render
app.get('/health', (req, res) => res.status(200).send("Alive"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Live on Port ${PORT}`);
});