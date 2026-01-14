import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/Frame 2.png';
import logo from '../assets/Frame 4.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  const [step, setStep] = useState(1);  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');  
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // 🔥 YAHAN CHANGE HAI: Localhost ko hamesha ke liye hata diya gaya hai
  const API_BASE_URL = "https://productr-app.onrender.com";

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
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

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // ✅ Ab ye Render ka link use karega
      const response = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (response.ok) {
        setStep(2);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Error connecting to server. Check: " + API_BASE_URL + "/health");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const enteredOtp = otp.join('');
    try {
      // ✅ Ab ye Render ka link use karega
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: enteredOtp }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userEmail', email.trim());
        window.location.assign('/'); 
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans overflow-hidden">
      <div className="w-full h-screen flex flex-col md:flex-row">
        
        {/* LEFT SIDE: Image Section */}
        <div className="w-full md:w-1/2 h-full p-4 md:p-8 flex items-center justify-center">
          <div className="w-full h-full rounded-[40px] overflow-hidden relative border border-slate-100 shadow-sm">
            <div className="absolute top-8 left-8 z-10">
              <img src={logo} alt="Productr Logo" className="h-8 md:h-10 object-contain" />
            </div>
            <img src={loginImage} alt="Branding" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* RIGHT SIDE: Form Section */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-10 md:px-20 relative bg-white">
          <div className="w-full max-w-[460px]">
            <h2 className="text-[28px] md:text-[32px] font-bold text-[#000066] mb-12 whitespace-nowrap text-left">
              {step === 1 ? "Login to your Productr Account" : "Verify Your Email"}
            </h2>
            
            <form onSubmit={step === 1 ? handleRequestOtp : handleVerifyOtp} className="space-y-8">
              {step === 1 ? (
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                    Email address
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-200 transition-all placeholder:text-gray-300 text-[15px]"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide text-center">
                    Enter the code sent to {email}
                  </label>
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        ref={el => inputRefs.current[index] = el}
                        className={`w-12 h-14 border-2 rounded-xl text-center font-bold text-xl outline-none transition-all ${
                          error ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#000066]'
                        }`}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {error && <p className="text-red-500 text-xs font-bold text-center mt-2">{error}</p>}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#000066] text-white py-4 rounded-xl font-bold text-[16px] shadow-lg hover:bg-[#00004d] transition-all active:scale-[0.98] disabled:bg-gray-300"
              >
                {loading ? "Processing..." : step === 1 ? "Get OTP" : "Verify & Login"}
              </button>
            </form>

            {/* Bottom Section */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[380px] border border-gray-100 rounded-[20px] p-5 text-center bg-gray-50/40">
              <p className="text-gray-400 text-[13px] font-medium">
                Don't have a Productr Account? <button type="button" className="text-[#000066] font-extrabold ml-1 hover:underline">SignUp Here</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;