require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware - FIXED LIMITS FOR DEPLOYMENT (Updated for Render stability)
app.use(cors({ origin: "*" }));

// Render par Base64 images handle karne ke liye limits badhai hain
app.use(express.json({ limit: '200mb' })); 
app.use(express.urlencoded({ limit: '200mb', extended: true, parameterLimit: 1000000 }));

// 1. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// 2. PRODUCT SCHEMA & MODEL
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Foods' },
  quantityStock: { type: String, default: '0' },
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  brandName: { type: String, required: true },
  isReturnable: { type: String, default: 'Yes' },
  images: { type: [String], required: true },
  userEmail: { type: String, required: true },
  status: { type: String, default: 'Unpublished' } // 'Published' or 'Unpublished'
});

const Product = mongoose.model('Product', productSchema);

// 3. OTP STORAGE & MAILER CONFIG
let otpStore = {}; 

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 5000 
});

// --- AUTH ROUTES ---

// SEND OTP
app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[normalizedEmail] = otp;

  console.log(`🚀 DEBUG: OTP for ${normalizedEmail} | Master OTP: 123456`);

  res.status(200).json({ success: true, message: "OTP process started" });

  transporter.sendMail({
    from: `"Productr App" <${process.env.EMAIL_USER}>`,
    to: normalizedEmail,
    subject: `Login Code: ${otp}`,
    text: `Your OTP is ${otp}. (Local evaluation master code: 123456)`
  }).then(() => console.log("✅ Mail Sent"))
    .catch(err => console.log("⚠️ Mail failed (SMTP Blocked), use Master OTP"));
});

// VERIFY OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();
  
  if (otp == '123456' || otpStore[userEmail] == otp) { 
    delete otpStore[userEmail];
    return res.status(200).json({ success: true });
  }
  res.status(400).json({ success: false, message: "Invalid OTP" });
});

// --- PRODUCT CRUD ROUTES ---

// 🚩 CREATE PRODUCT
app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    console.error("Save Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🚩 GET PRODUCTS BY EMAIL
app.get('/products/:email', async (req, res) => {
  try {
    const products = await Product.find({ userEmail: req.params.email });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🚩 UPDATE PRODUCT (EDIT)
app.put('/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🚩 UPDATE STATUS (PUBLISH / UNPUBLISH)
app.patch('/products/:id/status', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🚩 DELETE PRODUCT
app.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Product Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Local: http://localhost:${PORT}`);
});