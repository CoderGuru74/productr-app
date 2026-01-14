require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// 1. CORS & PAYLOAD CONFIG
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));

// 2. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err.message));

// Product Schema
const Product = mongoose.model('Product', new mongoose.Schema({
  name: String, category: String, quantityStock: String, mrp: String, 
  sellingPrice: String, brandName: String, images: [String], 
  status: { type: String, default: 'Published' }, userEmail: String,
  createdAt: { type: Date, default: Date.now }
}));

let otpStore = {}; 

/**
 * 3. BREVO SMTP CONFIG (Optimized for Activation)
 * Port 587 is the fastest to trigger Brevo's Step 3 confirmation.
 */
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // Must be false for 587
  auth: {
    user: process.env.EMAIL_USER, // Your Brevo Login Email
    pass: process.env.EMAIL_PASS  // Your Brevo SMTP Key
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 4. ROUTES
app.get('/', (req, res) => res.send("System is Live 🚀"));

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false });

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[normalizedEmail] = otp;

  console.log(`📨 Triggering Brevo for: ${normalizedEmail}`);
  console.log(`👉 DEBUG OTP (In case of lag): ${otp}`);

  // 🚩 TURANT RESPONSE: Vercel/Browser ko hang hone se bachata hai
  res.status(200).json({ success: true, message: "OTP sent to background" });

  // 🚩 BACKGROUND EMAIL SENDING
  transporter.sendMail({
    from: `"Productr Support" <${process.env.EMAIL_USER}>`,
    to: normalizedEmail,
    subject: `Login Code: ${otp}`,
    html: `<h3>Your Verification Code</h3><p style="font-size:20px; color:#00147B;"><b>${otp}</b></p>`
  }, (err, info) => {
    if (err) {
      console.log("❌ BREVO ERROR:", err.message);
    } else {
      console.log("✅ BREVO SUCCESS:", info.response);
    }
  });
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();
  
  // 🚩 DEADLINE SAFETY: Master OTP 123456 will always work
  if (otpStore[userEmail] == otp || otp == '123456') { 
    delete otpStore[userEmail];
    return res.status(200).json({ success: true });
  }
  res.status(400).json({ success: false, error: "Invalid OTP" });
});

// Product CRUD Routes
app.get('/products/:email', async (req, res) => {
  try {
    const ps = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(ps);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/products', async (req, res) => {
  try {
    const p = new Product(req.body);
    await p.save();
    res.status(201).json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. SERVER BINDING
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});