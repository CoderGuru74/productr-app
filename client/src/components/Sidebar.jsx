import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/Frame 4.png'; // Verify this path matches your logo location

const Sidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#1E2129] text-white flex flex-col p-4 z-[100] shadow-2xl">
      {/* Productr Branding */}
      <div className="mb-6 px-2 mt-2 flex items-center gap-2">
        <img src={logo} alt="Productr" className="h-8 object-contain" />
      </div>

      {/* Dark Sidebar Search Bar */}
      <div className="px-1 mb-8">
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-[#2A2E39] border-none rounded-lg py-2.5 pl-10 pr-4 text-xs outline-none text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[13px] font-bold ${
              isActive 
              ? 'bg-[#2A2E39] text-white shadow-sm' 
              : 'text-gray-400 hover:text-white hover:bg-[#2A2E39]/50'
            }`
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Home
        </NavLink>
        
        <NavLink 
          to="/products" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[13px] font-bold ${
              isActive 
              ? 'bg-[#2A2E39] text-white shadow-sm' 
              : 'text-gray-400 hover:text-white hover:bg-[#2A2E39]/50'
            }`
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          Products
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar; // CRITICAL: This line removes the red underline in Home.jsx