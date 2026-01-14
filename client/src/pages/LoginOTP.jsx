import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import promoImg from '../assets/Frame 2.png';

const LoginOTP = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
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

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(''); 
    const enteredOtp = otp.join('');

    try {
      const response = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otp: enteredOtp }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Save email to localStorage for session tracking
        localStorage.setItem('userEmail', email);
        
        console.log("✅ Backend verified. Redirecting to Dashboard...");
        
        // 2. FORCE REDIRECT: Refreshes the app to ensure App.js sees the new login
        window.location.assign('/'); 
      } else {
        // 3. UI ERROR: Show the red error state from design
        setError(data.error || "Please enter a valid OTP");
      }
    } catch (err) {
      setError("Connection error. Is your server running?");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="bg-white rounded-[40px] shadow-2xl flex flex-col md:flex-row w-full max-w-[1100px] h-[720px] overflow-hidden border border-slate-100">
        
        {/* LEFT PANEL: PROMOTIONAL SECTION */}
        <div className="hidden md:block w-1/2 p-6 h-full">
          <div className="relative w-full h-full rounded-[35px] overflow-hidden">
            <img src={promoImg} alt="Promo" className="absolute inset-0 w-full h-full object-cover" />
            
            {/* Design Logo Overlay */}
            <div className="absolute top-10 left-10 z-10">
               <div className="flex items-center gap-1">
                 <span className="text-[#00147B] font-black text-xl tracking-tighter">Productr</span>
                 <div className="w-4 h-4 bg-orange-500 rounded-full opacity-80"></div>
               </div>
            </div>

            {/* Figma-Style Runner Card */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[280px] h-[360px] bg-gradient-to-b from-orange-400 to-orange-600 rounded-[45px] shadow-2xl flex flex-col items-center justify-end pb-12 px-6 text-center border-[6px] border-orange-300/20">
                <p className="text-white font-extrabold text-[22px] leading-tight">
                  Uplist your <br /> product to market
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AUTHENTICATION */}
        <div className="flex-1 flex flex-col justify-center px-10 md:px-16 relative bg-white">
          <div className="w-full max-w-sm mx-auto">
            {/* Header matches Figma layout */}
            <h2 className="text-[24px] font-bold text-[#001D4D] mb-10 tracking-tight whitespace-nowrap">
              Login to your Productr Account
            </h2>

            {step === 1 ? (
              /* STEP 1: EMAIL ENTRY */
              <form onSubmit={handleSendOTP} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-800 uppercase tracking-[1px]">Email or Phone number</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="Enter email or phone number" 
                    className="w-full p-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00147B] transition-all placeholder:text-slate-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#00147B] text-white py-4.5 rounded-xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-50">
                  {loading ? "Sending..." : "Login"}
                </button>
              </form>
            ) : (
              /* STEP 2: OTP VERIFICATION */
              <form onSubmit={handleVerifyOTP} className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-slate-800 uppercase tracking-[1px]">Enter OTP</label>
                  <div className="flex justify-between gap-2.5">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        ref={el => inputRefs.current[index] = el}
                        className={`w-12 h-12 md:w-14 md:h-14 border-2 rounded-xl text-center font-bold text-xl outline-none transition-all ${
                          error ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-[#00147B]'
                        }`}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    ))}
                  </div>
                  {/* RED ERROR UI */}
                  {error && (
                    <p className="text-red-500 text-[11px] font-bold mt-2">
                      {error}
                    </p>
                  )}
                </div>
                <button type="submit" className="w-full bg-[#00147B] text-white py-4.5 rounded-xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all">
                  Enter your OTP
                </button>
                <p className="text-center text-[12px] text-slate-400 font-semibold">
                  Didn't receive OTP? <button type="button" onClick={() => setStep(1)} className="text-[#00147B] font-bold ml-1 hover:underline">Resend</button>
                </p>
              </form>
            )}
          </div>

          {/* SIGNUP BOX */}
          {step === 1 && (
            <div className="absolute bottom-12 left-0 right-0 flex justify-center px-10">
              <div className="w-full max-w-[340px] border border-slate-100 rounded-2xl py-4.5 text-center bg-slate-50/50 text-[13px] shadow-sm">
                <span className="text-slate-400 font-medium">Don't have a Productr Account? </span>
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