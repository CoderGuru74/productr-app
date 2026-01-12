import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        {/* This is the first page people see */}
        <Route path="/" element={<Login />} />
        
        {/* This is where they go after logging in */}
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;