require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB Connected"))
  .catch(e => console.log("❌ DB Error"));

let otpStore = {}; 

// 🚩 THE "RENDER-PROOF" CONFIG
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL/TLS is more stable on Render
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true, // Connection ko zinda rakhta hai
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 1
});

app.get('/', (req, res) => res.status(200).send("Backend Active! 🚀"));

app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false });

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[normalizedEmail] = otp;

  console.log(`📨 Delivery Triggered for: ${normalizedEmail}`);

  // 🚩 STEP 1: Turant Response bhej do (Taaki frontend timeout na ho)
  res.status(200).json({ success: true });

  // 🚩 STEP 2: Background mein mail bhej do (Wait mat karo)
  transporter.sendMail({
    from: `"Productr Support" <${process.env.EMAIL_USER}>`,
    to: normalizedEmail,
    subject: `Your Login Code: ${otp}`,
    html: `<h3>Your verification code is: <b style="font-size: 24px;">${otp}</b></h3>`
  }, (err, info) => {
    if (err) {
      console.log("❌ NODEMAILER FAILED:", err.message);
    } else {
      console.log("✅ NODEMAILER SUCCESS:", info.response);
    }
  });
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();
  if (otpStore[userEmail] == otp) {
    delete otpStore[userEmail];
    return res.status(200).json({ success: true });
  }
  res.status(400).json({ success: false });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Listening on port ${PORT}`);
});