import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Products from './pages/Products';
import LoginOTP from './pages/LoginOTP';

/**
 * AppLayout Wrapper
 * Controls the visibility of the Sidebar and manages the main content layout.
 * Ensures the 'ml-64' (margin-left) is only applied when the Sidebar is visible.
 */
const AppLayout = ({ children }) => {
  const location = useLocation();
  
  // The Sidebar should be hidden on the Login page for a professional look
  const isLoginPage = location.pathname === '/login-otp';

  return (
    <div className="flex h-screen w-full bg-[#F0F2F5] overflow-hidden font-sans">
      {/* 1. Show Sidebar only if NOT on the login page */}
      {!isLoginPage && <Sidebar />}
      
      {/* 2. Main Content Container
          If sidebar is hidden, we remove the margin (ml-0).
          If sidebar is visible, we push content (ml-64) to prevent covering.
      */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden ${isLoginPage ? 'ml-0' : 'ml-0'}`}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Dashboard Home Route */}
          <Route path="/" element={<Home />} />
          
          {/* Products Management Route */}
          <Route path="/products" element={<Products />} />
          
          {/* Functional OTP Login Route */}
          <Route path="/login-otp" element={<LoginOTP />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;