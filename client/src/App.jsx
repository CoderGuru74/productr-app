import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Products from './pages/Products';

function App() {
  return (
    <Router>
      <div className="flex h-screen w-full bg-[#F0F2F5] overflow-hidden">
        {/* The Sidebar is placed outside Routes so it never reloads */}
        <Sidebar />
        
        {/* The Right Side Content changes based on the URL */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;