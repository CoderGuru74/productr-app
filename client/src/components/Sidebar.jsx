import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/Frame 4.png';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#1E2129] text-white flex flex-col p-4 shadow-xl h-full flex-shrink-0">
      {/* Logo Section */}
      <div className="flex items-center gap-2 mb-6 px-2">
        <img src={logo} alt="Productr" className="h-7" />
      </div>

      {/* Sidebar Search Bar */}
      <div className="px-2 mb-6">
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-[#2A2E39] border-none rounded-md py-2 pl-9 pr-4 text-xs outline-none text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-[13px] font-bold ${
              isActive 
              ? 'bg-[#2A2E39] text-white' 
              : 'text-gray-400 hover:text-white hover:bg-[#2A2E39]/50'
            }`
          }
        >
          {/* Home SVG */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.1677 4.15068C9.51476 3.52416 8.48387 3.52416 7.83095 4.15068L4.36112 7.48018C4.2761 7.56175 4.21892 7.66802 4.19767 7.78391C3.78207 10.0503 3.75139 12.3705 4.10692 14.6471L4.19131 15.1875H6.42366V10.529C6.42366 10.2183 6.6755 9.96649 6.98616 9.96649H11.0125C11.3231 9.96649 11.575 10.2183 11.575 10.529V15.1875H13.8073L13.8917 14.6471C14.2472 12.3705 14.2166 10.0503 13.801 7.78391C13.7797 7.66802 13.7225 7.56175 13.6375 7.48018L10.1677 4.15068ZM7.05204 3.33894C8.14024 2.29474 9.85838 2.29474 10.9466 3.33894L14.4164 6.66844C14.6718 6.91353 14.8437 7.2328 14.9075 7.58099C15.3459 9.97171 15.3783 12.4192 15.0032 14.8207L14.8677 15.6888C14.8116 16.0478 14.5024 16.3125 14.139 16.3125H11.0125C10.7018 16.3125 10.45 16.0606 10.45 15.75V11.0915H7.54866V15.75C7.54866 16.0606 7.29682 16.3125 6.98616 16.3125H3.85961C3.49625 16.3125 3.18703 16.0478 3.13097 15.6888L2.9954 14.8207C2.62036 12.4192 2.65272 9.97171 3.09112 7.58099C3.15497 7.2328 3.32678 6.91353 3.58221 6.66843L7.05204 3.33894Z" fill="currentColor"/>
          </svg>
          Home
        </NavLink>
        
        <NavLink 
          to="/products" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-[13px] font-bold ${
              isActive 
              ? 'bg-[#2A2E39] text-white' 
              : 'text-gray-400 hover:text-white hover:bg-[#2A2E39]/50'
            }`
          }
        >
          {/* Product SVG */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.83351 4.83334V4.75343C4.83351 3.30826 5.81191 2.04644 7.21154 1.68653C7.72888 1.5535 8.27146 1.5535 8.7888 1.68653C10.1884 2.04644 11.1668 3.30827 11.1668 4.75343V4.83334H12.1676C12.5484 4.83334 12.8717 5.11267 12.9269 5.4895L13.0727 6.48446C13.3597 8.44344 13.3597 10.4338 13.0727 12.3927C12.9341 13.3388 12.1712 14.0701 11.2202 14.1688L10.8009 14.2122C8.93875 14.4054 7.06159 14.4054 5.19942 14.2122L4.78017 14.1688C3.82915 14.0701 3.06629 13.3388 2.92767 12.3928C2.64065 10.4338 2.64065 8.44343 2.92767 6.48446L3.07346 5.4895C3.12867 5.11266 3.4519 4.83334 3.83275 4.83334H4.83351ZM7.46058 2.65503C7.81455 2.56401 8.18579 2.56401 8.53976 2.65503C9.4974 2.90128 10.1668 3.76463 10.1668 4.75343V4.83334H5.83351V4.75343C5.83351 3.76463 6.50294 2.90128 7.46058 2.65503ZM4.83351 5.83334V7.33334C4.83351 7.60949 5.05736 7.83334 5.33351 7.83334C5.60965 7.83334 5.83351 7.60949 5.83351 7.33334V5.83334H10.1668V7.33334C10.1668 7.60949 10.3907 7.83334 10.6668 7.83334C10.943 7.83334 11.1668 7.60949 11.1668 7.33334V5.83334H11.9666L12.0832 6.62944C12.3562 8.49227 12.3562 10.3849 12.0832 12.2478C12.0109 12.7412 11.613 13.1227 11.117 13.1741L10.6978 13.2176C8.90418 13.4036 7.09616 13.4036 5.30257 13.2176L4.88332 13.1741C4.38729 13.1227 3.98941 12.7412 3.91711 12.2478C3.64417 10.3849 3.64417 8.49227 3.91711 6.62943L4.03375 5.83334H4.83351Z" fill="currentColor"/>
          </svg>
          Products
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;