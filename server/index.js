require('dotenv').config(); 
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * 1. UPDATED CORS CONFIGURATION
 * Fixes the PathError crash and solves the CORS block.
 */
const allowedOrigins = [
  "https://productr-app.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy block'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Use (.*) instead of * to prevent the Missing Parameter Name error in Node 22
app.options('(.*)', cors()); 

// Middleware to manually ensure headers are set (Final safety net)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});



app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. MONGODB ATLAS CONNECTION
const mongoURI = process.env.MONGO_URI;
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
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- API ROUTES ---

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
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && String(otpStore[email]) === String(otp)) {
    delete otpStore[email]; 
    res.status(200).json({ success: true, message: "Login successful" });
  } else {
    res.status(400).json({ success: false, error: "Please enter a valid OTP" });
  }
});

app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body); 
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.get('/products/:email', async (req, res) => {
  try {
    const products = await Product.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.patch('/products/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Product.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));