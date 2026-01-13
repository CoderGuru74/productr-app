import React, { useState, useEffect } from 'react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Published'); // Handles Published/Unpublished sections
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const userEmail = "pixelnodeofficial@gmail.com";

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/products/${userEmail}`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const togglePublishStatus = async (product) => {
    const newStatus = product.status === 'Published' ? 'Unpublished' : 'Published';
    try {
      const response = await fetch(`http://localhost:5000/products/${product._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setToastMsg(`Status updated to ${newStatus}`);
        setShowToast(true);
        fetchProducts(); // Refresh to move the item to the other tab
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      alert("Update failed");
    }
  };

  // Filter products strictly based on status for the Home dashboard
  const filteredProducts = products.filter((p) => p.status === activeTab);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* HEADER WITH GRADIENT AND TABS */}
      <header className="bg-white shadow-sm flex-shrink-0">
        {/* Top Tier: Home Breadcrumb and Profile */}
        <div className="h-16 flex items-center justify-between px-8 bg-gradient-to-r from-[#fdf7ff] via-[#f8f9ff] to-[#f0f4ff]">
          <div className="flex items-center gap-2 text-slate-700 text-sm font-bold">
            <span className="text-[16px]">🏠</span> Home
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden border border-slate-200">
              <img src="https://via.placeholder.com/32" alt="profile" />
            </div>
            <span className="text-slate-500 text-[10px]">▼</span>
          </div>
        </div>

        {/* Bottom Tier: Section Navigation */}
        <div className="h-14 flex items-center px-8 border-t border-slate-50">
          <div className="flex gap-10 h-full">
            {['Published', 'Unpublished'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold h-full border-b-2 transition-all flex items-center ${
                  activeTab === tab 
                  ? 'text-[#1D35D9] border-[#1D35D9]' 
                  : 'text-slate-400 border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <main className="flex-1 overflow-y-auto bg-[#F8F9FA] relative">
        {filteredProducts.length === 0 ? (
          /* EMPTY STATE - CENTERED */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="mb-6">
              {/* SVG Grid Icon with Plus */}
              <svg width="84" height="84" viewBox="0 0 24 24" fill="none" className="text-[#001D9D] mx-auto opacity-90">
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 17.5h7m-3.5-3.5v7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-[#1D2939] text-[20px] font-bold mb-2">No {activeTab} Products</h2>
            <p className="text-[#94a3b8] text-[13px] max-w-xs leading-relaxed">
              Your {activeTab} Products will appear here <br />
              Create your first product to publish
            </p>
          </div>
        ) : (
          /* PRODUCT GRID */
          <div className="p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">
              {activeTab} Section
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((p) => (
                <div key={p._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all">
                  <div className="p-4 bg-[#F8F9FA] h-52 flex items-center justify-center">
                    <div className="w-44 h-44 bg-white rounded-lg shadow-sm p-3 flex items-center justify-center">
                      <img 
                        src={p.images?.[0] || "https://via.placeholder.com/150"} 
                        alt="product" 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-slate-800 text-[15px] mb-4 truncate">{p.name}</h3>
                    <div className="space-y-1 text-[12px] text-slate-400 font-bold">
                      <div className="flex justify-between"><span>Product type -</span><span className="text-slate-800 font-medium">{p.category}</span></div>
                      <div className="flex justify-between"><span>MRP-</span><span className="text-slate-800 font-medium">₹ {p.mrp}</span></div>
                      <div className="flex justify-between"><span>Selling Price -</span><span className="text-slate-800 font-medium">₹ {p.sellingPrice}</span></div>
                      <div className="flex justify-between pt-2 border-t border-slate-50">
                        <span>Exchange Eligibility -</span>
                        <span className="text-slate-800">.{p.isReturnable}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <button 
                        onClick={() => togglePublishStatus(p)} 
                        className={`flex-1 py-2 rounded-md font-bold text-xs text-white shadow-sm transition-all active:scale-95 ${
                          p.status === 'Published' ? 'bg-[#FF6D00]' : 'bg-[#1D35D9]'
                        }`}
                      >
                        {p.status === 'Published' ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-white border border-slate-100 rounded-lg shadow-xl px-6 py-3 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
          <span className="text-slate-700 font-bold text-sm tracking-tight">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default Home;