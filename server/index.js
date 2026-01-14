require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. BULLETPROOF CORS CONFIGURATION
 * Ye Vercel aur Render ke beech ke handshake ko fix karega.
 */
app.use(cors()); // Allow all origins
app.options('*', cors()); // Enable pre-flight for all routes

app.use(express.json({ limit: '50mb' }));

// Manual Headers for extra safety
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

/**
 * 2. HEALTH CHECK
 * Check here: https://productr-app.onrender.com/health
 */
app.get('/health', (req, res) => {
  res.status(200).send("OK - Server is Alive");
});

// 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// 4. PRODUCT SCHEMA & MODEL
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Foods' },
  userEmail: { type: String, required: true },
  images: [String],
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

// 5. OTP STORAGE (In-memory)
let otpStore = {}; 

// 6. SEND OTP ROUTE
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const normalizedEmail = email.trim().toLowerCase();
    otpStore[normalizedEmail] = otp;

    console.log(`📨 Attempting to mail OTP to: ${normalizedEmail}`);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // 16-digit App Password
      }
    });

    await transporter.sendMail({
      from: `"Productr App" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Login OTP Verification',
      html: `<div style="padding:20px; border:1px solid #ddd;">
               <h2>Verification Code</h2>
               <h1 style="color:#000066;">${otp}</h1>
             </div>`
    });

    console.log(`✅ OTP sent successfully to ${normalizedEmail}`);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ MAIL ERROR:", error.message);
    // 502 error se bachne ke liye hum error response bhejenge par server chalta rahega
    return res.status(500).json({ 
      success: false, 
      error: "Mail system failed. Check your App Password in Render settings." 
    });
  }
});

// 7. VERIFY OTP ROUTE
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();

  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail];
    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
  }
});

// 8. PRODUCT ROUTES
app.get('/products/:email', async (req, res) => {
  try {
    const products = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save product" });
  }
});

// 9. PORT & START
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production Server Live on Port ${PORT}`);
});