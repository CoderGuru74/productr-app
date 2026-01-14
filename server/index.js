require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err.message));

let otpStore = {}; 

// 🚩 NODEMAILER: Sabse simple configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.get('/', (req, res) => res.send("Server is running! 🚀"));

app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  if(!email) return res.status(400).json({ success: false });

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[normalizedEmail] = otp;

  console.log(`📨 Request received for: ${normalizedEmail}`);

  // 🚩 STEP 1: Turant Response bhej do (Taaki frontend hang na ho)
  res.status(200).json({ success: true });

  // 🚩 STEP 2: Background mein mail bhej do (Wait mat karo)
  // Hum 'await' use NAHI karenge yahan
  transporter.sendMail({
    from: `"Productr Support" <${process.env.EMAIL_USER}>`,
    to: normalizedEmail,
    subject: `Your Login Code: ${otp}`,
    text: `Your OTP is ${otp}`,
    html: `<b>Your verification code is: ${otp}</b>`
  }, (err, info) => {
    if (err) {
      console.log("❌ MAIL ERROR:", err.message);
    } else {
      console.log("✅ MAIL DELIVERED:", info.response);
    }
  });
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();
  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail];
    return res.status(200).json({ success: true });
  }
  res.status(400).json({ success: false });
});

// Port binding for Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on 0.0.0.0:${PORT}`);
});