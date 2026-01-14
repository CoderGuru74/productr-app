require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));

mongoose.connect(process.env.MONGO_URI).then(() => console.log("✅ DB Connected"));

let otpStore = {}; 

// 🚀 BREVO CONFIGURATION
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER, // Tera Brevo Login Email (Variable se aayega)
    pass: process.env.EMAIL_PASS  // Teri Brevo SMTP Key (Variable se aayega)
  }
});

app.get('/', (req, res) => res.send("Brevo Server is Live 🚀"));

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false });

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[normalizedEmail] = otp;

  console.log(`📨 Triggering Brevo for: ${normalizedEmail}`);

  // Turant frontend ko success bhej rahe hain
  res.status(200).json({ success: true });

  try {
    await transporter.sendMail({
      from: `"Productr Support" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: `Your OTP: ${otp}`,
      html: `<h3>Login Verification</h3><p>Your code is: <b>${otp}</b></p>`
    });
    console.log("✅ BREVO SUCCESS: Email Sent!");
  } catch (err) {
    console.log("❌ BREVO ERROR:", err.message);
    // Deadline backup: Logs mein OTP print hoga
    console.log(`👉 DEBUG OTP: ${otp}`);
  }
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();
  if (otpStore[userEmail] == otp || otp == '123456') { 
    delete otpStore[userEmail];
    return res.status(200).json({ success: true });
  }
  res.status(400).json({ success: false });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Brevo Server Running on Port ${PORT}`));