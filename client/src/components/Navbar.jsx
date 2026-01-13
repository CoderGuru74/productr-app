import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const userEmail = "pixelnodeofficial@gmail.com";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* FIXED DARK SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#1D212B] flex flex-col text-white z-[100]">
        <div className="p-6 flex items-center gap-2">
          <div className="text-xl font-bold tracking-tight">Productr</div>
          <div className="w-5 h-5 bg-[#F05A28] rounded-full flex items-center justify-center">
             <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        
        <div className="px-4 mb-6">
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input type="text" placeholder="Search" className="w-full bg-[#2A2E39] border-none rounded-md py-2 pl-10 pr-4 text-xs outline-none text-white" />
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          <button onClick={() => navigate('/')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/') ? 'bg-[#2A2E39] text-white' : 'text-slate-400 hover:text-white'}`}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
             Home
          </button>
          <button onClick={() => navigate('/products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/products') ? 'bg-[#2A2E39] text-white' : 'text-slate-400 hover:text-white'}`}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"/><path d="M3 6H21"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
             Products
          </button>
        </nav>
      </aside>

      {/* FIXED TOP PROFILE BAR */}
      <header className="fixed top-0 left-64 right-0 bg-white border-b border-slate-100 h-14 flex items-center justify-between px-10 z-[90]">
        <div className="flex-1">
          {setSearchQuery && (
            <div className="relative max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs">🔍</span>
              <input type="text" placeholder="Search Products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border-none rounded-full py-1.5 pl-10 pr-4 text-xs outline-none" />
            </div>
          )}
        </div>
        <div className="relative" ref={profileRef}>
          <div onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 cursor-pointer">
             <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                <img src="https://via.placeholder.com/32" alt="avatar" />
             </div>
             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;