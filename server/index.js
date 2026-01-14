require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. UPDATED CORS CONFIGURATION
 * Added your specific Vercel path to the allowed origins.
 */
const allowedOrigins = [
  "https://productr-app.vercel.app",
  "https://productr-app-coderguru74s-projects.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS Policy Block'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Manual Middleware for Preflight and Headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
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

// 3. SCHEMAS
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
 * Ensure you use an "App Password" in your Render Environment Variables!
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- API ROUTES ---

/**
 * POST: Send OTP
 * Standardized response with success: true/false for frontend logic.
 */
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;
    
    console.log(`📨 Attempting to send OTP to ${email}`);

    const info = await transporter.sendMail({
      from: `"Productr App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Productr Login Code',
      text: `Your login code is ${otp}. It will expire in 10 minutes.`,
      html: `<div style="font-family: sans-serif; padding: 20px;">
              <h2>Login Verification</h2>
              <p>Your OTP code is: <b style="font-size: 24px; color: #000066;">${otp}</b></p>
              <p>This code will expire in 10 minutes.</p>
             </div>`
    });
    
    console.log("✅ Email sent successfully:", info.response);
    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    // Log the full error to Render console so we can debug the 500 error
    console.error("❌ NODEMAILER ERROR DETAIL:", error);
    res.status(500).json({ 
      success: false, 
      error: "Email Service Failed", 
      details: error.message 
    });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && String(otpStore[email]) === String(otp)) {
    delete otpStore[email]; 
    res.status(200).json({ success: true, message: "Login successful" });
  } else {
    res.status(400).json({ success: false, error: "Please enter a valid OTP" });
  }
});

// Product Routes
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