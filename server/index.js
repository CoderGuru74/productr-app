require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. CORS & PAYLOAD CONFIG
 * 'origin: "*"' ensures your Vercel frontend can always connect.
 */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * 2. DATABASE CONNECTION
 */
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

/**
 * 3. PRODUCT SCHEMA
 */
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

let otpStore = {}; 

/**
 * 4. NODEMAILER CONFIGURATION (The "Render Fix")
 * Using Port 587 with STARTTLS is the most reliable way on Render.
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Must be false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false, // Prevents connection drops
    minVersion: "TLSv1.2"
  }
});

/**
 * 5. API ROUTES
 */

// Health Check
app.get('/', (req, res) => res.send("Productr Backend is Running... 🚀"));

// Send OTP Route
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if(!email) return res.status(400).json({ error: "Email is required" });
  
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const normalizedEmail = email.trim().toLowerCase();
    otpStore[normalizedEmail] = otp;
    
    console.log(`📨 Attempting to send OTP to: ${normalizedEmail}`);

    const mailOptions = {
      from: `"Productr Support" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Your Productr Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #000066;">Verification Code</h2>
          <p>Your login code is:</p>
          <h1 style="color: #000066; font-size: 40px; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `
    };

    // We MUST await this so the function doesn't terminate early
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent Successfully:", info.response);
    
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Nodemailer Error:", error.message);
    res.status(500).json({ error: "Failed to send email", details: error.message });
  }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();

  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail]; 
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(400).json({ error: "Invalid OTP code" });
  }
});

// Product Routes (CRUD)
app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body); 
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/products/:email', async (req, res) => {
  try {
    const products = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/products/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/products/:id/status', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.status(200).json(updated);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));