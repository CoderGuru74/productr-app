const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. PAYLOAD CONFIGURATION
 * High limits are essential for Base64 image strings.
 */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// 2. MONGODB ATLAS CONNECTION
const mongoURI = "mongodb+srv://pixel_node:Pixelnode7488%40@cluster0.uuq92lo.mongodb.net/productrDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Cloud MongoDB Atlas Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// 3. PRODUCT SCHEMA
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

// 4. USER SCHEMA
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
}));

// 5. OTP Storage (Temporary memory)
let otpStore = {}; 

/**
 * 6. NODEMAILER CONFIGURATION
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pixelnodeofficial@gmail.com',
    pass: 'vyjh miom jzjb xrvz' 
  }
});

// --- API ROUTES ---

// Create Product
app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body); 
    const savedProduct = await newProduct.save();
    console.log("✨ Product Created:", savedProduct.name);
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product", details: error.message });
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

// Toggle Status
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

/**
 * POST: Send OTP
 * Generates a 6-digit code and sends it via email.
 */
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;
    
    console.log(`📨 OTP generated for ${email}: ${otp}`);

    await transporter.sendMail({
      from: 'pixelnodeofficial@gmail.com',
      to: email,
      subject: 'Productr OTP Code',
      text: `Your login code is ${otp}`
    });
    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST: Verify OTP
 * Compares entered code with stored code using String conversion to avoid mismatches.
 */
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  console.log(`🔍 Verifying: ${email} | Stored: ${otpStore[email]} | Received: ${otp}`);

  // String conversion ensures comparison works even if one is a number
  if (otpStore[email] && String(otpStore[email]) === String(otp)) {
    console.log("✅ OTP Verified Successfully");
    delete otpStore[email]; // Clear OTP after use
    res.status(200).json({ message: "Login successful" });
  } else {
    console.log("❌ Invalid OTP Attempt");
    res.status(400).json({ error: "Please enter a valid OTP" });
  }
});

app.listen(5000, () => console.log('🚀 Server is running on http://localhost:5000'));