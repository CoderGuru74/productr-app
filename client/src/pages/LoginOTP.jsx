import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import promoImg from '../assets/Frame 2.png';

const LoginOTP = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // State for error message
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Auto-focus logic for 6-digit grid
  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(''); // Clear error when user types

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setStep(2); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * REFINED VERIFICATION LOGIC
   * Specifically fixed to handle successful login
   */
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(''); 
    const enteredOtp = otp.join('');

    if (enteredOtp.length < 6) {
      setError("Please enter a valid OTP");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otp: enteredOtp }),
      });

      const data = await response.json();

      if (response.ok) {
        // Log user email for session persistence
        localStorage.setItem('userEmail', email);
        // Successful login redirect
        navigate('/'); 
      } else {
        // Display red error UI
        setError(data.error || "Please enter a valid OTP");
      }
    } catch (err) {
      setError("Connection error. Is your server running?");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[40px] shadow-2xl flex flex-col md:flex-row w-full max-w-[1100px] h-[720px] overflow-hidden border border-slate-100">
        
        {/* LEFT PANEL: PROMOTIONAL IMAGE */}
        <div className="hidden md:block w-1/2 p-6 h-full">
          <div className="relative w-full h-full rounded-[35px] overflow-hidden">
            <img src={promoImg} alt="Promo" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        </div>

        {/* RIGHT PANEL: AUTHENTICATION */}
        <div className="flex-1 flex flex-col justify-center px-10 md:px-20 relative bg-white">
          <div className="w-full max-w-sm mx-auto">
            <h2 className="text-[28px] font-bold text-[#001D4D] mb-10 tracking-tight">
              Login to your Productr Account
            </h2>

            {step === 1 ? (
              /* STEP 1: EMAIL ENTRY */
              <form onSubmit={handleSendOTP} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-800 uppercase tracking-[1px]">
                    Email or Phone number
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="Enter email or phone number" 
                    className="w-full p-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00147B] transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00147B] text-white py-4.5 rounded-xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Login"}
                </button>
              </form>
            ) : (
              /* STEP 2: OTP ENTRY */
              <form onSubmit={handleVerifyOTP} className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-slate-800 uppercase tracking-[1px]">
                    Enter OTP
                  </label>
                  <div className="flex justify-between gap-2.5">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        ref={el => inputRefs.current[index] = el}
                        // Apply error styling
                        className={`w-12 h-12 md:w-14 md:h-14 border-2 rounded-xl text-center font-bold text-xl outline-none transition-all ${
                          error ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-[#00147B]'
                        }`}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    ))}
                  </div>
                  {/* RED ERROR MESSAGE */}
                  {error && (
                    <p className="text-red-500 text-[11px] font-bold mt-2">
                      {error}
                    </p>
                  )}
                </div>
                <button 
                  type="submit"
                  className="w-full bg-[#00147B] text-white py-4.5 rounded-xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all"
                >
                  Enter your OTP
                </button>
                <p className="text-center text-[12px] text-slate-400 font-semibold">
                  Didn't receive OTP? <button type="button" onClick={() => setStep(1)} className="text-[#00147B] font-bold ml-1">Resend in 20s</button>
                </p>
              </form>
            )}
          </div>

          {step === 1 && (
            <div className="absolute bottom-12 left-0 right-0 flex justify-center px-10">
              <div className="w-full max-w-[340px] border border-slate-100 rounded-2xl py-4.5 text-center bg-slate-50/50 text-[13px]">
                <span className="text-slate-400">Don't have a Productr Account? </span>
                <button className="text-[#00147B] font-extrabold ml-1 hover:underline">SignUp Here</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginOTP;