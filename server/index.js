require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. BULLETPROOF CORS & PAYLOAD
 */
app.use(cors({
  origin: "*", // Sabhi origins allow kar diye taaki Vercel block na ho
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
  .then(() => console.log("✅ Cloud MongoDB Atlas Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

/**
 * 3. SCHEMAS
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
 * 4. NODEMAILER CONFIG (Render Optimized)
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Render ke liye 587 best hai
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Connection drop hone se bachayega
  }
});

/**
 * 5. API ROUTES
 */

// Health Check (Zaroori hai Render ke liye)
app.get('/', (req, res) => res.send("Server is Live 🚀"));

// Create Product
app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body); 
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Fetch Products
app.get('/products/:email', async (req, res) => {
  try {
    const products = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Product
app.put('/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Toggle Status (PATCH)
app.patch('/products/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Product.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Product
app.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if(!email) return res.status(400).json({ error: "Email required" });
  
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email.trim().toLowerCase()] = otp;
    
    console.log(`📨 Sending OTP to ${email}`);

    await transporter.sendMail({
      from: `"Productr Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Productr OTP Code',
      html: `<h3>Your login code is: <b>${otp}</b></h3>`
    });
    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    res.status(500).json({ error: "Failed to send OTP", details: error.message });
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
    res.status(400).json({ error: "Please enter a valid OTP" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));