require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. CORS CONFIGURATION
 * Sabhi connections allow karne ke liye.
 */
app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

/**
 * 2. HEALTH CHECK
 */
app.get('/health', (req, res) => res.status(200).send("Server is Healthy ✅"));

// 3. MONGODB CONNECTION (Keep MONGO_URI in Render only for security)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err.message));

// 4. PRODUCT SCHEMA
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

// 6. SEND OTP ROUTE (With Hardcoded Gmail Credentials)
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const normalizedEmail = email.trim().toLowerCase();
    otpStore[normalizedEmail] = otp;

    console.log(`📨 Requesting OTP for: ${normalizedEmail}`);

    /**
     * 🚩 HARDCODED EMAIL CREDENTIALS
     * Humne yahan direct password aur email daal diya hai 
     * taaki Render Variables ka issue khatam ho jaye.
     */
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'pixelnodeofficial@gmail.com', // Aapka email
        pass: 'vyjh miom jzjb xrvz'          // Aapka 16-digit App Password
      }
    });

    // Pehle connection check karte hain
    await transporter.verify();

    const mailOptions = {
      from: `"Productr App" <pixelnodeofficial@gmail.com>`,
      to: normalizedEmail,
      subject: 'Login OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #eee;">
          <h2 style="color: #000066;">Productr Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #000066; font-size: 40px;">${otp}</h1>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Success! OTP sent: ${info.response}`);
    
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ NODEMAILER FATAL ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      error: `Mail System Error: ${error.message}` 
    });
  }
});

// 7. VERIFY OTP ROUTE
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userEmail = email.trim().toLowerCase();

  if (otpStore[userEmail] && String(otpStore[userEmail]) === String(otp)) {
    delete otpStore[userEmail];
    console.log(`✅ OTP Verified for ${userEmail}`);
    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({ success: false, error: "Invalid OTP code" });
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

// 9. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Live on Port ${PORT}`);
});