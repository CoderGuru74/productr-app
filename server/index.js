require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. CORS FIX
 */
app.use(cors({
  origin: ["https://productr-app.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

/**
 * 2. HEALTH CHECK
 */
app.get('/health', (req, res) => res.status(200).send("OK"));

// 3. DATABASE
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

let otpStore = {}; 

/**
 * 4. SEND OTP ROUTE (Fixed for Timeout)
 */
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email required" });

  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[normalizedEmail] = otp;

  console.log(`📨 Attempting to send OTP to: ${normalizedEmail}`);

  try {
    /**
     * 🚩 PORT 587 FIX
     * Render ke liye Port 587 + secure: false hi sabse best hai.
     */
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Port 587 ke liye false hona chahiye
      auth: {
        user: 'pixelnodeofficial@gmail.com',
        pass: 'wnux dvib bgsw rllg' 
      },
      tls: {
        // Isse connection fail nahi hoga agar SSL handshake slow ho
        rejectUnauthorized: false
      }
    });

    // Pehle verify karo ki connection ban raha hai
    await transporter.verify();
    console.log("✅ Transporter is ready to take our messages");

    const mailOptions = {
      from: '"Productr App" <pixelnodeofficial@gmail.com>',
      to: normalizedEmail,
      subject: 'Login OTP Verification',
      text: `Your OTP is: ${otp}`
    };

    await transporter.sendMail(mailOptions);
    
    console.log(`✅ Success: OTP sent to ${normalizedEmail}`);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error.message);
    return res.status(500).json({ 
      success: false, 
      error: "Connection timeout", 
      details: error.message 
    });
  }
});

/**
 * 5. VERIFY OTP ROUTE
 */
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();

  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail];
    return res.status(200).json({ success: true });
  }
  return res.status(400).json({ success: false, error: "Invalid OTP" });
});

// 6. PRODUCT SCHEMA & ROUTES
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});