require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// 1. CORS & PAYLOAD
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. DATABASE
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.error("❌ DB Error:", err.message));

// Schemas (Same as yours)
const Product = mongoose.model('Product', new mongoose.Schema({
  name: String, category: String, quantityStock: String, mrp: String, 
  sellingPrice: String, brandName: String, images: [String], 
  status: { type: String, default: 'Published' }, userEmail: String,
  createdAt: { type: Date, default: Date.now }
}));

let otpStore = {}; 

/**
 * 3. THE "RENDER-PROOF" TRANSPORTER
 * Maine yahan timeout aur connection pooling add ki hai.
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS ke liye false zaroori hai
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false, // Connection drop hone se bachayega
    minVersion: "TLSv1.2"
  },
  pool: true, // Connection ko zinda rakhta hai
  maxConnections: 1,
  connectionTimeout: 20000, // 20 seconds wait karega
});

/**
 * 4. SEND-OTP ROUTE
 */
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if(!email) return res.status(400).json({ error: "Email missing" });
  
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const userEmail = email.trim().toLowerCase();
    otpStore[userEmail] = otp;
    
    console.log(`📨 Render is sending OTP to: ${userEmail}`);

    const info = await transporter.sendMail({
      from: `"Productr Support" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Login Verification Code',
      html: `<div style="padding:20px; border:1px solid #ddd; border-radius:10px;">
               <h2>Your OTP: <span style="color:#000066;">${otp}</span></h2>
               <p>Use this code to login to your Productr account.</p>
             </div>`
    });

    console.log("✅ NODEMAILER SUCCESS:", info.response);
    res.status(200).json({ message: "OTP Sent" });

  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error.message);
    // 500 error ke saath exact reason bhejna
    res.status(500).json({ error: "Email delivery failed", details: error.message });
  }
});

// ... baaki routes (Verify, Products) same rahenge ...
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();
  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail];
    return res.status(200).json({ success: true });
  }
  res.status(400).json({ error: "Invalid OTP" });
});

// CRUD for Products
app.post('/products', async (req, res) => {
    try { const p = new Product(req.body); await p.save(); res.status(201).json(p); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/products/:email', async (req, res) => {
    try { const ps = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 }); res.json(ps); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/products/:id', async (req, res) => {
    try { await Product.findByIdAndDelete(req.params.id); res.json({ m: "Deleted" }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));