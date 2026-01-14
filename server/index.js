require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// 1. CORS Setup
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));

// 2. MONGODB
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

  // Transporter configuration for Port 587
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // 587 ke liye false hi hona chahiye
    auth: {
      user: 'pixelnodeofficial@gmail.com',
      pass: 'wnux dvib bgsw rllg' 
    },
    tls: {
      rejectUnauthorized: false // Local aur Render dono ke liye safety
    }
  });

  try {
    // 🚩 Yahan wait karna zaroori hai taaki email nikal jaye
    let info = await transporter.sendMail({
      from: '"Productr App" <pixelnodeofficial@gmail.com>',
      to: normalizedEmail,
      subject: `Login OTP: ${otp}`,
      text: `Your login code is: ${otp}`,
      html: `<h3>Your Verification Code: <b>${otp}</b></h3>`
    });

    console.log(`✅ EMAIL DELIVERED: ${info.response}`);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(`❌ NODEMAILER ERROR: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
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
  return res.status(400).json({ success: false, error: "Invalid OTP" });
});

// 5. PRODUCT SCHEMA & ROUTES
const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    userEmail: String,
    images: [String],
    createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

app.get('/products/:email', async (req, res) => {
  try {
    const products = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ success: true });
  } catch (error) { res.status(500).json({ error: "Save failed" }); }
});

app.get('/health', (req, res) => res.status(200).send("OK"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});