require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// 1. CORS & PAYLOAD
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));

// 2. DATABASE
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err.message));

const Product = mongoose.model('Product', new mongoose.Schema({
  name: String, category: String, quantityStock: String, mrp: String, 
  sellingPrice: String, brandName: String, images: [String], 
  status: { type: String, default: 'Published' }, userEmail: String,
  createdAt: { type: Date, default: Date.now }
}));

let otpStore = {}; 

/**
 * 3. TRANSPORTER (Optimized for Port 587)
 * Render par 587 + STARTTLS sabse zyada successful hai.
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Port 587 ke liye hamesha false
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Connection drop hone se bachata hai
  }
});

/**
 * 4. SEND OTP ROUTE
 */
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if(!email) return res.status(400).json({ success: false });

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[normalizedEmail] = otp;

  console.log(`📨 Attempting to send OTP to: ${normalizedEmail}`);

  // Mail setup
  const mailOptions = {
    from: `"Productr Support" <${process.env.EMAIL_USER}>`,
    to: normalizedEmail,
    subject: 'Verification Code',
    html: `<div style="padding:20px; border:1px solid #ddd; border-radius:10px;">
             <h2 style="color:#000066;">Your OTP: ${otp}</h2>
             <p>Use this code to login.</p>
           </div>`
  };

  try {
    // 🚩 TIMEOUT SE BACHNE KE LIYE: Hum wait nahi karenge
    // Seedha success response bhej rahe hain
    res.status(200).json({ success: true, message: "Accepted" });

    // Email piche se jayega
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("❌ NODEMAILER ERROR:", error.message);
      }
      console.log("✅ EMAIL DELIVERED:", info.response);
    });

  } catch (error) {
    console.log("❌ Route Crash:", error.message);
    if(!res.headersSent) res.status(500).json({ success: false });
  }
});

// ... baaki routes (verify-otp, products) same rahenge ...
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();
  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail];
    return res.status(200).json({ success: true });
  }
  res.status(400).json({ success: false });
});

app.get('/products/:email', async (req, res) => {
    try { const ps = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 }); res.json(ps); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/products/:id', async (req, res) => {
    try { await Product.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));