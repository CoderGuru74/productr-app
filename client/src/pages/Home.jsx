import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Unpublished'); 
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // UPDATED: Get dynamic email from localStorage instead of hardcoding
  const userEmail = localStorage.getItem('userEmail');

  const fetchProducts = async () => {
    if (!userEmail) return;
    try {
      // UPDATED: Points to live Render backend
      const response = await fetch(`https://productr-app.onrender.com/products/${userEmail}`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [userEmail]);

  const togglePublishStatus = async (product) => {
    const newStatus = product.status === 'Published' ? 'Unpublished' : 'Published';
    try {
      // UPDATED: Points to live Render backend
      const response = await fetch(`https://productr-app.onrender.com/products/${product._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setToastMsg(`Status updated to ${newStatus}`);
        setShowToast(true);
        fetchProducts(); 
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      alert("Update failed");
    }
  };

  const filteredProducts = products.filter((p) => p.status === activeTab);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-w-0 bg-white relative">
        <Navbar />

        <header className="bg-white border-b border-slate-100 flex-shrink-0 h-14 mt-14 z-10">
          <div className="h-full flex items-center px-8 gap-10">
            {['Published', 'Unpublished'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`h-full text-[13px] font-bold transition-all border-b-[3px] flex items-center px-1 tracking-tight ${
                  activeTab === tab 
                  ? 'text-[#445069] border-[#1D35D9]' 
                  : 'text-[#94a3b8] border-transparent hover:text-[#445069]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative bg-[#F8F9FA]">
          {filteredProducts.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-white">
              <div className="mb-6">
                 <svg width="84" height="84" viewBox="0 0 24 24" fill="none" className="text-[#001D9D] mx-auto opacity-90">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 17.5h7m-3.5-3.5v7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
              </div>
              <h2 className="text-[#1D2939] text-[20px] font-bold mb-2 tracking-tight">No {activeTab} Products</h2>
              <p className="text-[#94a3b8] text-[13px] max-w-xs leading-relaxed">
                Your {activeTab} Products will appear here <br />
                Create your first product to publish
              </p>
            </div>
          ) : (
            <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((p) => (
                <div key={p._id} className="bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all h-full">
                  <div className="p-4 bg-[#F9FAFB] flex items-center justify-center">
                    <div className="w-full h-48 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center p-2 border border-slate-50">
                      <img src={p.images?.[0] || "https://via.placeholder.com/150"} alt="product" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-[#1D2939] text-sm mb-4 truncate">{p.name}</h3>
                    <div className="space-y-2 text-[11px] text-[#94a3b8] font-bold flex-1">
                      <div className="flex justify-between items-center">
                        <span>Product type</span>
                        <div className="flex-grow border-b border-dotted border-slate-200 mx-2"></div>
                        <span className="text-[#1D2939] font-medium">{p.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>MRP</span>
                        <div className="flex-grow border-b border-dotted border-slate-200 mx-2"></div>
                        <span className="text-[#1D2939] font-medium">₹ {p.mrp}</span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button 
                        onClick={() => togglePublishStatus(p)} 
                        className={`w-full py-2.5 rounded-lg font-bold text-xs text-white transition-all active:scale-95 ${
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
          )}
        </main>
      </div>

      {showToast && (
        <div className="fixed bottom-10 right-10 bg-white border border-slate-100 rounded-xl shadow-2xl px-6 py-3 flex items-center gap-3 z-[200]">
          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs shadow-md shadow-emerald-100">✓</span>
          <span className="text-slate-700 font-bold text-sm">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default Home;