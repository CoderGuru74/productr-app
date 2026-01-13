import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/Frame 4.png';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#1E2129] text-white flex flex-col p-6 shadow-xl h-full">
      <div className="flex items-center gap-2 mb-8">
        <img src={logo} alt="Productr" className="h-7" />
      </div>
      <nav className="space-y-4">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center gap-3 p-2 rounded-lg transition-all text-sm font-bold ${
              isActive ? 'bg-blue-600/10 border-l-4 border-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`
          }
        >
          <span>🏠</span> Home
        </NavLink>
        <NavLink 
          to="/products" 
          className={({ isActive }) => 
            `flex items-center gap-3 p-2 rounded-lg transition-all text-sm font-bold ${
              isActive ? 'bg-blue-600/10 border-l-4 border-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`
          }
        >
          <span>📦</span> Products
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;