import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';

/**
 * ProtectedRoute Component
 * Checks localStorage to ensure only logged-in users can see Home/Products.
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('userEmail');
  return isAuthenticated ? children : <Navigate to="/login-otp" replace />;
};

/**
 * LayoutWrapper Component
 * Handles responsive layout logic for Sidebar and Main Content.
 */
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('userEmail');
  const isLoginPage = location.pathname === '/login-otp';
  const showSidebar = isAuthenticated && !isLoginPage;

  return (
    <div className="flex h-screen w-full bg-[#F8F9FB] overflow-hidden relative">
      {/* Sidebar logic is now internally responsive */}
      {showSidebar && <Sidebar />}
      
      {/* 🚀 MAIN CONTENT FIX:
        - ml-0: Mobile par margin nahi hoga (Content full width dikhega).
        - md:ml-64: Laptop/Desktop (md breakpoint) par 64 units ka margin left se aayega.
        - transition-all: Layout change hone par smooth transition dega.
      */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${showSidebar ? 'ml-0 md:ml-64' : 'ml-0'}`}>
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
          {/* Public Route */}
          <Route path="/login-otp" element={<Login />} />
          
          {/* Protected Routes */}
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

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;