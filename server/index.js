require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. MANUAL CORS HANDLER
 * Library par depend rehne ke bajaye hum khud headers set kar rahe hain
 * taaki 502 Bad Gateway aur CORS error hamesha ke liye khatam ho jaye.
 */
app.use((req, res, next) => {
  // Sabhi origins allow karne ke liye '*' ya apni Vercel URL use karein
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  // Browsers jab POST request bhejte hain toh pehle OPTIONS check karte hain
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Payload limit for images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * 2. HEALTH CHECK
 */
app.get('/health', (req, res) => {
  res.status(200).send("Server is Healthy and Running ✅");
});

// 3. MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// 4. PRODUCT SCHEMA
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Foods' },
  userEmail: { type: String, required: true },
  images: [String],
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

// 5. OTP STORAGE (In-memory)
let otpStore = {}; 

/**
 * 6. SEND OTP ROUTE
 */
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const normalizedEmail = email.trim().toLowerCase();
    otpStore[normalizedEmail] = otp;

    console.log(`📨 Attempting to send OTP to: ${normalizedEmail}`);

    // Transporter with your NEW password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'pixelnodeofficial@gmail.com',
        pass: 'wnux dvib bgsw rllg' 
      }
    });

    // Send the email
    await transporter.sendMail({
      from: '"Productr App" <pixelnodeofficial@gmail.com>',
      to: normalizedEmail,
      subject: 'Login OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; text-align: center;">
          <h2 style="color: #000066;">Your Verification Code</h2>
          <h1 style="color: #000066; font-size: 40px; letter-spacing: 5px;">${otp}</h1>
          <p>Please use this code to log in to your account.</p>
        </div>
      `
    });

    console.log(`✅ Success: OTP sent to ${normalizedEmail}`);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error.message);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to send OTP. Please check backend logs." 
    });
  }
});

/**
 * 7. VERIFY OTP ROUTE
 */
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

// 8. PRODUCT GET & POST
app.get('/products/:email', async (req, res) => {
  try {
    const products = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.status(200).json(products);
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

/**
 * 9. SERVER START
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Live on Port ${PORT}`);
});