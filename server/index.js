require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));

// 1. DATABASE
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

let otpStore = {}; 

// 2. NODEMAILER CONFIG (Port 587 is the only way on Render)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Must be false for 587
  auth: {
    user: 'pixelnodeofficial@gmail.com',
    pass: 'wnux dvib bgsw rllg' 
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 3. SEND OTP ROUTE
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false });

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[normalizedEmail] = otp;

  console.log(`📨 Attempting OTP for: ${normalizedEmail}`);

  // Step 1: Send Immediate Success to Frontend (Prevents CORS/502)
  res.status(200).json({ success: true });

  // Step 2: Background Email Delivery
  try {
    await transporter.sendMail({
      from: '"Productr Support" <pixelnodeofficial@gmail.com>',
      to: normalizedEmail,
      subject: `Your OTP: ${otp}`,
      text: `Your login code is ${otp}`,
      html: `<b>Your verification code is: <span style="font-size:24px;">${otp}</span></b>`
    });
    console.log(`✅ EMAIL DELIVERED to ${normalizedEmail}`);
  } catch (error) {
    console.error(`❌ EMAIL FAILED: ${error.message}`);
  }
});

// 4. VERIFY OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();
  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail];
    return res.status(200).json({ success: true });
  }
  return res.status(400).json({ success: false });
});

app.get('/health', (req, res) => res.status(200).send("OK"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Live on Port ${PORT}`));