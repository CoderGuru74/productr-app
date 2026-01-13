import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/Frame 2.png';
import logo from '../assets/Frame 4.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle requesting the OTP (Sign Up / Login)
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep(2);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      alert("Error connecting to server. Is your backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  // Handle verifying the OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (data.success) {
        navigate('/home'); // Redirect to Dashboard on success
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (err) {
      alert("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans overflow-hidden">
      <div className="w-full h-screen flex flex-col md:flex-row">
        
        {/* LEFT SIDE: Image Section with Logo Overlay */}
        <div className="w-full md:w-1/2 h-full p-4 md:p-8 flex items-center justify-center">
          <div className="w-full h-full rounded-[40px] overflow-hidden relative">
            
            {/* LOGO Overlay */}
            <div className="absolute top-8 left-8 z-10">
              <img 
                src={logo} 
                alt="Productr Logo" 
                className="h-8 md:h-10 object-contain" 
              />
            </div>

            {/* MAIN BRANDING IMAGE */}
            <img 
              src={loginImage} 
              alt="Branding" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* RIGHT SIDE: Form Section */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-10 md:px-20">
          <div className="w-full max-w-[460px]">
            {/* Heading stays on one line */}
            <h2 className="text-[28px] md:text-[32px] font-bold text-[#000066] mb-12 whitespace-nowrap">
              {step === 1 ? "Login to your Productr Account" : "Verify Your Email"}
            </h2>
            
            <form onSubmit={step === 1 ? handleRequestOtp : handleVerifyOtp} className="space-y-6">
              {step === 1 ? (
                /* EMAIL INPUT STEP */
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email or Phone number
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email or phone number"
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-300"
                    required
                  />
                </div>
              ) : (
                /* OTP INPUT STEP */
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                    Enter the 6-digit code sent to {email}
                  </label>
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="0 0 0 0 0 0"
                    maxLength="6"
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-50 transition-all placeholder-gray-300 text-center text-2xl tracking-[0.5em] font-bold"
                    required
                  />
                </div>
              )}
              
              <button 
                disabled={loading}
                className="w-full bg-[#000066] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-all shadow-md disabled:bg-gray-400"
              >
                {loading ? "Processing..." : step === 1 ? "Get OTP" : "Verify & Login"}
              </button>

              {step === 2 && (
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-gray-500 hover:text-[#000066] mt-2"
                >
                  Change Email
                </button>
              )}
            </form>

            {/* Bottom Section: SignUp Link */}
            <div className="mt-24 border-2 border-dashed border-gray-100 rounded-[24px] p-8 text-center bg-gray-50/30">
              <p className="text-gray-400 text-sm font-medium">
                Don't have a Productr Account?
              </p>
              <button className="text-[#000066] font-extrabold text-lg mt-1 hover:underline">
                SignUp Here
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;