require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. CORS CONFIGURATION
 * Vercel frontend se connection allow karne ke liye settings.
 */
app.use(cors({
  origin: true, // Sabhi sources ko allow karta hai (Mobile/Laptop)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Payload limits for images (Base64 data handling)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * 2. HEALTH CHECK ROUTE
 * Test Link: https://productr-app.onrender.com/health
 */
app.get('/health', (req, res) => {
  res.status(200).send("Server is running perfectly! ✅");
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

// 5. OTP STORAGE (Temporary in-memory)
let otpStore = {}; 

// 6. NODEMAILER TRANSPORTER
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Aapka 16-digit App Password
  }
});

// --- API ROUTES ---

// OTP BHEJNA
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
      subject: 'Your Login OTP - Productr App',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #000066;">Productr Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #000066; font-size: 40px;">${otp}</h1>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${normalizedEmail}`);
    
    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error.message);
    return res.status(500).json({ success: false, error: "Failed to send email. Check App Password." });
  }
});

// OTP VERIFY KARNA
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, error: "Email and OTP required" });

  const userEmail = email.trim().toLowerCase();
  
  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail]; // Ek baar use hone par delete kar dein
    console.log(`✅ OTP Verified for ${userEmail}`);
    return res.status(200).json({ success: true });
  } else {
    console.log(`❌ Invalid OTP attempt for ${userEmail}`);
    return res.status(400).json({ success: false, error: "Invalid OTP code" });
  }
});

// PRODUCTS FETCH KARNA
app.get('/products/:email', async (req, res) => {
  try {
    const products = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// NAYA PRODUCT ADD KARNA
app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body); 
    const savedProduct = await newProduct.save();
    return res.status(201).json(savedProduct);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create product" });
  }
});

/**
 * 7. SERVER INITIALIZATION
 * Render dynamically assigns a port, else defaults to 5000.
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Live on Port: ${PORT}`);
});