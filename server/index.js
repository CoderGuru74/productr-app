require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. UPDATED CORS CONFIGURATION
 * Allows requests from your specific Vercel URL
 */
const allowedOrigins = [
  "https://productr-app.vercel.app",
  "https://productr-app-coderguru74s-projects.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS Policy Block'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Manual Middleware to catch the "OPTIONS" preflight and set headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});



// Payload limits for Base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. MONGODB ATLAS CONNECTION
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("✅ Cloud MongoDB Atlas Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// 3. PRODUCT SCHEMA
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

// 4. OTP Storage (Temporary memory)
let otpStore = {}; 

/**
 * 5. NODEMAILER CONFIGURATION
 * FIXED: Uses Port 465 (SSL) which is more reliable on Render.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // MUST be a 16-character Google App Password
  }
});

// --- API ROUTES ---

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;
    
    console.log(`📨 Attempting to send OTP: ${otp} to ${email}`);

    await transporter.sendMail({
      from: `"Productr App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Productr Login Code',
      text: `Your login code is ${otp}.`,
      html: `<b>Your login code is ${otp}</b>`
    });
    
    console.log("✅ Email sent successfully via Gmail SMTP");
    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error.message);
    res.status(500).json({ success: false, error: "Email service failed", details: error.message });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  console.log(`🔍 Verifying ${email} with OTP: ${otp}`);

  if (otpStore[email] && String(otpStore[email]) === String(otp)) {
    delete otpStore[email]; 
    res.status(200).json({ success: true, message: "Login successful" });
  } else {
    res.status(400).json({ success: false, error: "Invalid OTP code" });
  }
});

// Product GET, POST, PUT, DELETE Routes
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

app.put('/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));