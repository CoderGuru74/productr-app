const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * CRITICAL FIX: The "offset out of range" and 500 errors happen because
 * Base64 strings are massive. We must increase the JSON limit to 50MB.
 */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// 1. MongoDB Atlas Connection
const mongoURI = "mongodb+srv://pixel_node:Pixelnode7488%40@cluster0.uuq92lo.mongodb.net/productrDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Cloud MongoDB Atlas Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// 2. User Schema
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
}));

/**
 * 3. Updated Product Schema
 * We use [String] for images to store multiple Base64 strings.
 * Default values prevent the server from crashing on empty fields.
 */
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Foods' },
  quantityStock: { type: String, default: '' },
  mrp: { type: String, default: '' },
  sellingPrice: { type: String, default: '' },
  brandName: { type: String, default: '' },
  isReturnable: { type: String, default: 'Yes' },
  images: { type: [String], default: [] }, // Array for multiple photos
  status: { type: String, default: 'Published' },
  userEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// 4. OTP Storage (Temporary memory)
let otpStore = {}; 

// 5. Nodemailer Config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pixelnodeofficial@gmail.com', // 👈 Update to your actual Gmail
    pass: 'vyjh miom jzjb xrvz'    // 👈 Your App Password
  }
});

// --- API ROUTES ---

// A. Send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
      await user.save();
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;
    
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Productr OTP Code',
      text: `Your login code is ${otp}`
    });
    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// B. Verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email].toString() === otp.toString()) {
    delete otpStore[email];
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP" });
  }
});

// C. Create Product
app.post('/products', async (req, res) => {
  try {
    // Check if userEmail exists in the request
    if (!req.body.userEmail) {
      return res.status(400).json({ error: "userEmail is required" });
    }

    const newProduct = new Product(req.body); 
    const savedProduct = await newProduct.save();
    
    console.log("✨ Product Saved Successfully:", savedProduct.name);
    res.status(201).json(savedProduct);
  } catch (error) {
    // Logs specific error to your terminal (e.g., validation or buffer issues)
    console.error("❌ DATABASE SAVE ERROR:", error.message);
    res.status(500).json({ 
      error: "Database save failed", 
      details: error.message 
    });
  }
});

// D. Get User Products
app.get('/products/:email', async (req, res) => {
  try {
    const products = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// E. Update Product Status
app.patch('/products/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Product.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// F. Delete Product
app.delete('/products/:id', async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Product deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));