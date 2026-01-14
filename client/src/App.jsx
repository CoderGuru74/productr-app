import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('userEmail');
  return isAuthenticated ? children : <Navigate to="/login-otp" replace />;
};

/**
 * 🚀 FIXED LayoutWrapper
 */
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('userEmail');
  const isLoginPage = location.pathname === '/login-otp';
  const showSidebar = isAuthenticated && !isLoginPage;

  return (
    <div className="flex h-screen w-full bg-[#F8F9FB] overflow-hidden relative">
      {/* Sidebar Component */}
      {showSidebar && <Sidebar />}
      
      {/* 🚩 FIX: md:ml-64 use kiya hai. 
          Mobile par margin 0 rahega (ml-0), 
          aur Desktop (md) par 64 units ka margin left se aayega.
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
          <Route path="/login-otp" element={<Login />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;