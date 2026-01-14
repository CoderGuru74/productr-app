require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. CORS CONFIGURATION
 * 'origin: true' allows connection from any device (phone/laptop).
 */
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Payload limits for images (Base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * 2. HEALTH CHECK ROUTE
 * Deployment ke baad check karein: https://[your-app-name].onrender.com/health
 */
app.get('/health', (req, res) => {
  res.status(200).send("OK");
});

// 3. MONGODB ATLAS CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Cloud MongoDB Atlas Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// 4. PRODUCT SCHEMA
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Foods' },
  quantityStock: { type: String, default: '' },
  mrp: { type: String, default: '' },
  sellingPrice: { type: String, default: '' },
  brandName: { type: String, default: '' },
  isReturnable: { type: String, default: 'Yes' },
  images: { type: [String], default: [] }, 
  status: { type: String, default: 'Published' }, 
  userEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// 5. OTP STORAGE (Temporary memory)
let otpStore = {}; 

// 6. NODEMAILER
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- API ROUTES ---

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email.trim().toLowerCase()] = otp;
    
    console.log(`📨 Sending OTP: ${otp} to ${email}`);

    await transporter.sendMail({
      from: `"Productr App" <${process.env.EMAIL_USER}>`,
      to: email.trim().toLowerCase(),
      subject: 'Login OTP Verification',
      html: `<h3>Your code is: ${otp}</h3><p>Valid for a limited time.</p>`
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error.message);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();
  
  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail]; 
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, error: "Invalid OTP code" });
  }
});

// Product API
app.get('/products/:email', async (req, res) => {
  try {
    const products = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body); 
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

/**
 * 7. PORT BINDING FIX
 * Render process.env.PORT use karta hai. 
 * Localhost par ye automatically 5000 le lega.
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Live on 0.0.0.0:${PORT}`);
});