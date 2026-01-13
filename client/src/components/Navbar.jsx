import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userEmail, setUserEmail] = useState("Guest"); 
  const profileRef = useRef(null);

  // Fetch the actual logged-in email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
  }, []);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowProfileMenu(!showProfileMenu);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * handleLogout
   * Clears the session and forces a full page refresh.
   * This is critical to ensure the Sidebar disappears immediately.
   */
  const handleLogout = () => {
    localStorage.removeItem('userEmail'); // Clear the session
    setShowProfileMenu(false);
    
    // FORCE REDIRECT: Refreshes the app to ensure Sidebar state is reset
    window.location.assign('/login-otp'); 
  };

  return (
    <header className="fixed top-0 left-64 right-0 bg-white border-b border-slate-100 h-14 flex items-center justify-between px-10 z-[90]">
      
      <div className="flex items-center min-w-[20px]">
        {location.pathname === '/products' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-500">
            <path fillRule="evenodd" clipRule="evenodd" d="M4.83351 4.83334V4.75343C4.83351 3.30826 5.81191 2.04644 7.21154 1.68653C7.72888 1.5535 8.27146 1.5535 8.7888 1.68653C10.1884 2.04644 11.1668 3.30827 11.1668 4.75343V4.83334H12.1676C12.5484 4.83334 12.8717 5.11267 12.9269 5.4895L13.0727 6.48446C13.3597 8.44344 13.3597 10.4338 13.0727 12.3927C12.9341 13.3388 12.1712 14.0701 11.2202 14.1688L10.8009 14.2122C8.93875 14.4054 7.06159 14.4054 5.19942 14.2122L4.78017 14.1688C3.82915 14.0701 3.06629 13.3388 2.92767 12.3928C2.64065 10.4338 2.64065 8.44343 2.92767 6.48446L3.07346 5.4895C3.12867 5.11266 3.4519 4.83334 3.83275 4.83334H4.83351ZM7.46058 2.65503C7.81455 2.56401 8.18579 2.56401 8.53976 2.65503C9.4974 2.90128 10.1668 3.76463 10.1668 4.75343V4.83334H5.83351V4.75343C5.83351 3.76463 6.50294 2.90128 7.46058 2.65503ZM4.83351 5.83334V7.33334C4.83351 7.60949 5.05736 7.83334 5.33351 7.83334C5.60965 7.83334 5.83351 7.60949 5.83351 7.33334V5.83334H10.1668V7.33334C10.1668 7.60949 10.3907 7.83334 10.6668 7.83334C10.943 7.83334 11.1668 7.60949 11.1668 7.33334V5.83334H11.9666L12.0832 6.62944C12.3562 8.49227 12.3562 10.3849 12.0832 12.2478C12.0109 12.7412 11.613 13.1227 11.117 13.1741L10.6978 13.2176C8.90418 13.4036 7.09616 13.4036 5.30257 13.2176L4.88332 13.1741C4.38729 13.1227 3.98941 12.7412 3.91711 12.2478C3.64417 10.3849 3.64417 8.49227 3.91711 6.62943L4.03375 5.83334H4.83351Z" fill="currentColor"/>
          </svg>
        )}
      </div>

      <div className="flex items-center gap-6">
        {location.pathname === '/products' && (
          <div className="relative w-72">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Search Services, Products" 
              value={searchQuery || ''} 
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)} 
              className="w-full bg-slate-50 rounded-full py-2.5 pl-12 pr-4 text-[12px] outline-none border-none focus:ring-1 focus:ring-blue-100 transition-all placeholder:text-slate-400" 
            />
          </div>
        )}

        <div className="relative" ref={profileRef}>
          <div onClick={toggleMenu} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-all">
            <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden shadow-sm bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 shadow-2xl rounded-xl p-2 z-[999]">
              <div className="px-3 py-2 border-b border-slate-50 mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                <p className="text-xs font-semibold text-slate-700 truncate">{userEmail}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;