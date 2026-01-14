require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// 1. CORS & PAYLOAD (Very important for Base64)
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));

// 2. DATABASE
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err.message));

// Products Schema
const Product = mongoose.model('Product', new mongoose.Schema({
  name: String, category: String, quantityStock: String, mrp: String, 
  sellingPrice: String, brandName: String, images: [String], 
  status: { type: String, default: 'Published' }, userEmail: String,
  createdAt: { type: Date, default: Date.now }
}));

let otpStore = {}; 

// 3. NODEMAILER (Render-ready)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

// 4. ROUTES
app.get('/', (req, res) => res.send("Backend is Running! 🚀"));

app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  if(!email) return res.status(400).json({ success: false });

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[normalizedEmail] = otp;

  console.log(`📨 Request for: ${normalizedEmail}`);

  // Fast response for Frontend
  res.status(200).json({ success: true });

  // Background Mail
  transporter.sendMail({
    from: `"Productr Support" <${process.env.EMAIL_USER}>`,
    to: normalizedEmail,
    subject: 'Login Code',
    html: `<h3>Your code is: <b>${otp}</b></h3>`
  }, (err, info) => {
    if (err) return console.log("❌ Mail Error:", err.message);
    console.log("✅ EMAIL SENT:", info.response);
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

app.get('/products/:email', async (req, res) => {
    try { const ps = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 }); res.json(ps); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. SERVER BINDING (Fixes the "Stuck" issue)
// Render wants port 10000 or the one provided in process.env
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on 0.0.0.0:${PORT}`);
});