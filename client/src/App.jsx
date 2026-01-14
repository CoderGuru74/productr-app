import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';

/**
 * ProtectedRoute Component
 * This now checks localStorage every time the route is accessed.
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('userEmail');
  // If not logged in, send them to login page
  return isAuthenticated ? children : <Navigate to="/login-otp" replace />;
};

/**
 * LayoutWrapper Component
 * Handles the conditional rendering of the Sidebar based on current state.
 */
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('userEmail');
  const isLoginPage = location.pathname === '/login-otp';

  return (
    <div className="flex h-screen w-full bg-[#F8F9FB] overflow-hidden">
      {/* Sidebar only shows if user is logged in AND not on login page */}
      {isAuthenticated && !isLoginPage && <Sidebar />}
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;