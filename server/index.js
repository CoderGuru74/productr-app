require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. UNIVERSAL CORS CONFIGURATION
 * origin: true allows any domain (Vercel, Localhost, etc.) to connect.
 * This is the safest way to fix "Error connecting to server" on mobile.
 */
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

/**
 * 2. MANUAL PREFLIGHT HANDSHAKE
 * Mobile browsers (Safari/Chrome) send an "OPTIONS" request first.
 * If the server doesn't respond with 200 OK, the phone blocks the connection.
 */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});



// Middleware for parsing data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * 3. HEALTH CHECK ROUTE
 * If you visit https://productr-app.onrender.com/health on your phone 
 * and see "OK", your server is officially reachable from the internet.
 */
app.get('/health', (req, res) => {
  res.status(200).send("OK");
});

// 4. MONGODB ATLAS CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Cloud MongoDB Atlas Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// 5. PRODUCT SCHEMA
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

// 6. OTP STORAGE (In-memory)
let otpStore = {}; 

// 7. NODEMAILER CONFIGURATION
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

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email.trim().toLowerCase()] = otp;
    
    console.log(`📨 Attempting to send OTP: ${otp} to ${email}`);

    await transporter.sendMail({
      from: `"Productr App" <${process.env.EMAIL_USER}>`,
      to: email.trim().toLowerCase(),
      subject: 'Your Productr Login Code',
      html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #00147B;">Verification Code</h2>
              <p>Your OTP code is: <b style="font-size: 28px; color: #00147B;">${otp}</b></p>
              <p style="color: #666; font-size: 12px;">This code will expire shortly.</p>
             </div>`
    });
    
    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error.message);
    res.status(500).json({ success: false, error: "Email service failed" });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();
  
  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail]; 
    res.status(200).json({ success: true, message: "Login successful" });
  } else {
    res.status(400).json({ success: false, error: "Invalid OTP code" });
  }
});

// 8. START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Production Server Live on 0.0.0.0:${PORT}`);
});