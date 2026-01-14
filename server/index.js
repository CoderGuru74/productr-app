require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. CORS CONFIGURATION
 * Allows your Vercel frontend to talk to this Render backend.
 */
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

/**
 * 2. HEALTH CHECK
 * URL: https://productr-app.onrender.com/health
 */
app.get('/health', (req, res) => {
  res.status(200).send("OK - Server is Live and Healthy! ✅");
});

// 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// 4. PRODUCT SCHEMA & MODEL
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Foods' },
  userEmail: { type: String, required: true },
  images: [String],
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

// 5. OTP STORAGE
let otpStore = {}; 

// 6. NODEMAILER CONFIGURATION (Optimized for Render)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Must be false for port 587
  auth: {
    user: process.env.EMAIL_USER, // pixelnodeofficial@gmail.com
    pass: process.env.EMAIL_PASS  // vyjh miom jzjb xrvz
  },
  tls: {
    rejectUnauthorized: false // Prevents connection dropping on Render
  }
});

// 7. SEND OTP ROUTE
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const normalizedEmail = email.trim().toLowerCase();
    otpStore[normalizedEmail] = otp;

    console.log(`📨 Requesting OTP for: ${normalizedEmail}`);

    const mailOptions = {
      from: `"Productr App" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Login OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; text-align: center;">
          <h2 style="color: #000066;">Productr Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #000066; font-size: 48px; letter-spacing: 5px;">${otp}</h1>
          <p>This code is valid for a limited time.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Success: OTP sent to ${normalizedEmail}`);
    
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error.message);
    // Returning 500 but with a clear message to help you debug
    return res.status(500).json({ 
      success: false, 
      error: `Mail failed: ${error.message}` 
    });
  }
});

// 8. VERIFY OTP ROUTE
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();

  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail];
    console.log(`✅ OTP Verified for ${userEmail}`);
    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
  }
});

// 9. PRODUCT ROUTES
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

// 10. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Live on Port ${PORT}`);
});