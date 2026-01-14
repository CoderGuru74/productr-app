require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// 🚩 FAST BOOT: Turant Response ke liye headers
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));

// 🚩 DB connection ko background mein daal diya taaki server fast boot ho
mongoose.connect(process.env.MONGO_URI).then(() => console.log("✅ DB Connected")).catch(e => console.log("❌ DB Error"));

let otpStore = {}; 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// 🚩 HEALTH CHECK: Render isi ko check karke 'Live' karta hai
app.get('/', (req, res) => res.status(200).send("OK"));

app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email.trim().toLowerCase()] = otp;

  console.log(`📨 Request for: ${email}`);

  // 🚩 IMMEDIATE RESPONSE: Taaki connection timeout na ho
  res.status(200).json({ success: true });

  // Background email
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Login Code: ${otp}`,
    text: `Your OTP is ${otp}`
  }, (err) => {
    if(err) console.log("❌ Mail Error:", err.message);
    else console.log("✅ MAIL SENT");
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

// 🚩 FORCE RENDER PORT
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVER ACTIVE ON PORT ${PORT}`);
});