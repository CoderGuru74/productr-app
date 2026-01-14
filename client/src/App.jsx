import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Products from './pages/Products';
// ✅ Updated import to match your LoginOTP component
import LoginOTP from './pages/LoginOTP';

/**
 * ProtectedRoute Component
 * Checks for userEmail in localStorage. 
 * If missing, redirects to login page.
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('userEmail');
  
  if (!isAuthenticated) {
    return <Navigate to="/login-otp" replace />;
  }
  
  return children;
};

/**
 * LayoutWrapper Component
 * Controls Sidebar visibility and page layout.
 */
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('userEmail');
  
  // Sidebar should only show if user is authenticated AND not on the login page
  const isLoginPage = location.pathname === '/login-otp';
  const showSidebar = isAuthenticated && !isLoginPage;

  return (
    <div className="flex h-screen w-full bg-[#F8F9FB] overflow-hidden">
      {showSidebar && <Sidebar />}
      
      <div className={`flex-1 flex flex-col h-full overflow-hidden ${!showSidebar ? 'w-full' : ''}`}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login-otp" element={<LoginOTP />} />
          
          {/* Protected Main Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } 
          />

          {/* Fallback: If route doesn't exist, send to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;