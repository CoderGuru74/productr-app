const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());

// 1. Fixed MongoDB Atlas Connection String with URL Encoding for the '@'
const mongoURI = "mongodb+srv://pixel_node:Pixelnode7488%40@cluster0.uuq92lo.mongodb.net/productrDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Cloud MongoDB Atlas Connected Successfully"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error Details:");
    console.error(err.message);
  });

// 2. Models
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
}));

const Product = mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  userEmail: String,
  createdAt: { type: Date, default: Date.now }
}));

// 3. OTP Storage
let otpStore = {}; 

// 4. Nodemailer Config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pixelnodeofficial@gmail.com', // 👈 Update this to your Gmail
    pass: 'vyjh miom jzjb xrvz'    // 👈 Your App Password
  }
});

// 5. API Routes
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
      subject: 'Productr OTP',
      text: `Your login code is ${otp}`
    });
    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    console.error("OTP Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email].toString() === otp.toString()) {
    delete otpStore[email];
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP" });
  }
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));