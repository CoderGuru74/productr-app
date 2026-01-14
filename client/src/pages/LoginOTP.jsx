import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import promoImg from '../assets/Frame 2.png';

const LoginOTP = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 
  const [timer, setTimer] = useState(0); 
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // ✅ NO LOCALHOST, NO ENV VARIABLES. DIRECT RENDER LINK.
  const API_BASE_URL = "https://productr-app.onrender.com";

  useEffect(() => {
    // Ye console check karne ke liye hai ki phone par sahi URL load hua ya nahi
    console.log("System Check: Connecting to " + API_BASE_URL);
    
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); 
    setOtp(newOtp);
    setError(''); 

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData('text').trim();
    if (data.length === 6 && /^\d+$/.test(data)) {
      setOtp(data.split(''));
      inputRefs.current[5].focus();
    }
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        setStep(2); 
        setTimer(60); 
      } else {
        setError(data.error || "Server error. Please try again.");
      }
    } catch (err) {
      // Agar ye error aaye, matlab mobile internet backend tak nahi pahunch raha
      setError("Connection failed. Check if https://productr-app.onrender.com/health is OK");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true);
    const enteredOtp = otp.join('');

    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: enteredOtp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('userEmail', email.trim());
        window.location.assign('/'); 
      } else {
        setError(data.error || "Invalid OTP code.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white rounded-[40px] shadow-2xl flex flex-col md:flex-row w-full max-w-[1100px] h-[720px] overflow-hidden border border-slate-100">
        
        {/* LEFT PANEL */}
        <div className="hidden md:block w-1/2 p-6 h-full">
          <div className="relative w-full h-full rounded-[35px] overflow-hidden">
            <img src={promoImg} alt="Promo" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute top-10 left-10 z-10">
               <div className="flex items-center gap-1">
                 <span className="text-[#00147B] font-black text-xl tracking-tighter">Productr</span>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col justify-center px-10 md:px-16 relative bg-white">
          <div className="w-full max-sm mx-auto">
            <h2 className="text-[24px] font-bold text-[#001D4D] mb-10 tracking-tight">
              {step === 1 ? "Login to your Account" : "Enter Verification Code"}
            </h2>

            <form onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP} className="space-y-8">
              {step === 1 ? (
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-800 uppercase tracking-[1px]">Email address</label>
                  <input 
                    type="email" required placeholder="Enter email address" 
                    className="w-full p-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00147B]"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-slate-800 uppercase tracking-[1px]">OTP sent to {email}</label>
                  <div className="flex justify-between gap-2.5">
                    {otp.map((digit, index) => (
                      <input
                        key={index} type="text" inputMode="numeric" maxLength="1"
                        ref={el => inputRefs.current[index] = el}
                        onPaste={handlePaste}
                        className={`w-12 h-12 md:w-14 md:h-14 border-2 rounded-xl text-center font-bold text-xl outline-none ${
                          error ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-[#00147B]'
                        }`}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-red-500 text-[11px] font-bold">{error}</p>}

              <button type="submit" disabled={loading} className="w-full bg-[#00147B] text-white py-4.5 rounded-xl font-bold text-sm shadow-xl disabled:opacity-50">
                {loading ? "Please wait..." : step === 1 ? "Get OTP" : "Verify & Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginOTP;