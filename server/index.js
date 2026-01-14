require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. CORS CONFIGURATION
 * Allows your Vercel frontend to communicate with this backend.
 */
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '50mb' }));

/**
 * 2. DATABASE CONNECTION
 */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// OTP Storage (In-memory)
let otpStore = {}; 

/**
 * 3. SEND OTP ROUTE
 * Optimized with background delivery to prevent 502/CORS errors.
 */
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[normalizedEmail] = otp;

  console.log(`📨 Request received for: ${normalizedEmail}`);

  // 🚩 STEP 1: Turant success response bhejo taaki Vercel timeout na kare
  res.status(200).json({ success: true, message: "OTP process started" });

  // 🚩 STEP 2: Background mein email bhejte raho
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'pixelnodeofficial@gmail.com',
      pass: 'wnux dvib bgsw rllg' // Fresh working App Password
    }
  });

  const mailOptions = {
    from: '"Productr Support" <pixelnodeofficial@gmail.com>',
    to: normalizedEmail,
    subject: `Your Login Verification Code: ${otp}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-top: 5px solid #000066;">
          <h2 style="color: #000066; text-align: center;">Productr Account Access</h2>
          <p style="color: #333; font-size: 16px;">Hello,</p>
          <p style="color: #666; font-size: 14px;">Use the code below to complete your login:</p>
          <div style="background: #f0f0f7; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #000066; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">This code will expire in 10 minutes.</p>
        </div>
      </div>
    `
  };

  transporter.sendMail(mailOptions)
    .then(info => console.log(`✅ EMAIL DELIVERED: ${info.response}`))
    .catch(err => console.error(`❌ EMAIL FAILED: ${err.message}`));
});

/**
 * 4. VERIFY OTP ROUTE
 */
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();

  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail];
    console.log(`✅ OTP Verified for ${userEmail}`);
    return res.status(200).json({ success: true });
  }
  return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
});

/**
 * 5. HEALTH CHECK
 */
app.get('/health', (req, res) => res.status(200).send("Alive and Kicking ✅"));

/**
 * 6. PRODUCT SCHEMA & ROUTES (Basic Setup)
 */
const productSchema = new mongoose.Schema({
    name: String,
    userEmail: String,
    createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

app.get('/products/:email', async (req, res) => {
  try {
    const products = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Live on Port ${PORT}`);
});