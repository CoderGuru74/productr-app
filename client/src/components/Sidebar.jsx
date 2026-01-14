import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/Frame 4.png'; 

const Sidebar = () => {
  // Mobile par sidebar kholne/band karne ke liye state
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    window.location.assign('/login-otp');
  };

  return (
    <>
      {/* 🍔 MOBILE HAMBURGER BUTTON (Sirf mobile pe dikhega) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[200] p-2 bg-[#1E2129] text-white rounded-lg shadow-lg"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        )}
      </button>

      {/* 🌑 OVERLAY (Sidebar khulne pe background dark karne ke liye) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* 🚀 SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-[#1E2129] text-white flex flex-col p-4 z-[100] shadow-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
      `}>
        {/* Productr Branding */}
        <div className="mb-6 px-2 mt-2 flex items-center justify-between gap-2">
          <img src={logo} alt="Productr" className="h-8 object-contain" />
          {/* Mobile pe Close button andar bhi de sakte hain */}
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Dark Sidebar Search Bar */}
        <div className="px-1 mb-8">
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-[#2A2E39] border-none rounded-lg py-2.5 pl-10 pr-4 text-xs outline-none text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          <NavLink 
            to="/" 
            onClick={() => setIsOpen(false)} // Click pe mobile pe sidebar band ho jaye
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[13px] font-bold ${
                isActive ? 'bg-[#2A2E39] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2A2E39]/50'
              }`
            }
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </NavLink>
          
          <NavLink 
            to="/products" 
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[13px] font-bold ${
                isActive ? 'bg-[#2A2E39] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2A2E39]/50'
              }`
            }
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Products
          </NavLink>
        </nav>

        {/* Logout Button Section */}
        <div className="mt-auto border-t border-gray-700 pt-4 pb-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all text-[13px] font-bold"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;