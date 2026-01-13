require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. BULLETPROOF CORS CONFIGURATION
 * This allows your Vercel frontend to communicate with Render.
 * app.options('*') handles the "preflight" check that was causing your 404/CORS error.
 */
app.use(cors({
  origin: [
    "https://productr-app.vercel.app", 
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options('*', cors()); // Enable pre-flight for all routes



// Payload limits for Base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. MONGODB ATLAS CONNECTION
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Cloud MongoDB Atlas Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// 3. SCHEMAS
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

// 4. OTP Storage (Temporary memory)
let otpStore = {}; 

/**
 * 5. NODEMAILER CONFIGURATION
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- API ROUTES ---

/**
 * POST: Send OTP
 * We add { success: true } so the frontend knows to move to Step 2.
 */
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;
    
    console.log(`📨 OTP generated for ${email}: ${otp}`);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Productr OTP Code',
      text: `Your login code is ${otp}`
    });
    
    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to send email. Check backend logs." });
  }
});

/**
 * POST: Verify OTP
 */
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  console.log(`🔍 Verifying: ${email} | Stored: ${otpStore[email]} | Received: ${otp}`);

  if (otpStore[email] && String(otpStore[email]) === String(otp)) {
    console.log("✅ OTP Verified Successfully");
    delete otpStore[email]; 
    res.status(200).json({ success: true, message: "Login successful" });
  } else {
    console.log("❌ Invalid OTP Attempt");
    res.status(400).json({ success: false, error: "Please enter a valid OTP" });
  }
});

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

// Fetch Products per User
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

// Toggle Status (Publish/Unpublish)
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

// 6. START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));