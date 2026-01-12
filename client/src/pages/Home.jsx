import React, { useState, useEffect } from 'react';
import logo from '../assets/Frame 4.png';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    category: '',
    quantityStock: '',
    mrp: '',
    sellingPrice: '',
    brandName: '',
    isReturnable: 'Yes',
    images: []
  });

  const userEmail = "test@gmail.com"; 

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/products/${userEmail}`);
      const data = await response.json();
      setProducts(data);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setForm(prev => ({
            ...prev,
            images: [...prev.images, compressedBase64]
          }));
        };
      };
    });
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userEmail }),
      });
      if (response.ok) {
        setShowModal(false);
        setForm({ name: '', category: '', quantityStock: '', mrp: '', sellingPrice: '', brandName: '', isReturnable: 'Yes', images: [] });
        fetchProducts();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        const errorData = await response.json();
        alert("Server Error: " + (errorData.details || errorData.error));
      }
    } catch (err) {
      alert("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1E2129] text-white flex flex-col p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-8">
          <img src={logo} alt="Productr" className="h-7" />
        </div>
        <div className="relative mb-8 text-gray-400">
          <input type="text" placeholder="Search" className="w-full bg-[#2C2F36] rounded-md py-2 px-4 text-xs outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-gray-400 p-2 cursor-pointer text-sm hover:text-white transition-colors"><span>🏠</span> Home</div>
          <div className="flex items-center gap-3 text-white bg-blue-600/10 p-2 cursor-pointer rounded-lg border-l-4 border-blue-600 font-bold text-sm shadow-sm"><span>📦</span> Products</div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
             <span>🏠</span> <span className="text-gray-300">/</span> <span>Products</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
               <input type="text" placeholder="Search Services, Products" className="bg-[#F3F6F9] rounded-full py-2 px-10 text-xs w-80 outline-none border border-transparent focus:border-blue-200 transition-all" />
               <span className="absolute left-4 top-2.5 text-gray-400 text-xs">🔍</span>
            </div>
            <button onClick={() => setShowModal(true)} className="text-gray-600 font-bold text-[13px] hover:text-blue-700 transition-colors">+ Add Products</button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                <img src="https://ui-avatars.com/api/?name=User" alt="profile" />
            </div>
          </div>
        </header>

        {/* PRODUCTS GRID */}
        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group">
                <div className="p-4 bg-[#F8F9FA] h-52 flex items-center justify-center relative">
                  <div className="w-44 h-44 bg-white rounded-lg shadow-sm p-3 flex items-center justify-center">
                    <img src={p.images?.[0] || "https://via.placeholder.com/150"} alt="product" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 truncate">{p.name}</h3>
                  <div className="space-y-1 text-[11px] text-slate-500 font-bold">
                    <div className="flex justify-between"><span>Product type -</span><span className="text-slate-800 font-medium">{p.category}</span></div>
                    <div className="flex justify-between"><span>Quantity Stock -</span><span className="text-slate-800 font-medium">{p.quantityStock}</span></div>
                    <div className="flex justify-between"><span>MRP -</span><span className="text-slate-800 font-medium">₹ {p.mrp}</span></div>
                    <div className="flex justify-between"><span>Selling Price -</span><span className="text-slate-800 font-medium">₹ {p.sellingPrice}</span></div>
                    <div className="flex justify-between"><span>Brand Name -</span><span className="text-slate-800 font-medium">{p.brandName}</span></div>
                    <div className="flex justify-between border-t border-slate-50 pt-2 mt-2 font-bold uppercase tracking-wider"><span>Exchange Eligibility -</span><span className="text-slate-800">.{p.isReturnable}</span></div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button className="bg-[#1D35D9] text-white flex-1 py-2 rounded-md font-bold text-xs hover:bg-blue-800">Publish</button>
                    <button className="flex-1 border border-slate-200 py-2 rounded-md font-bold text-slate-700 text-xs flex items-center justify-center gap-2 hover:bg-slate-50">Edit 🖱️</button>
                    <button className="w-10 border border-slate-200 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* EXACT DIALOG BOX */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-[420px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-lg">
              <h2 className="text-sm font-bold text-slate-600">Add Product</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 text-xl font-light hover:text-slate-600">×</button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Product Name</label>
                <input type="text" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-200" placeholder="CakeZone Walnut Brownie" required />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Product Type</label>
                <select value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm text-slate-400 bg-white outline-none">
                  <option value="" disabled>Select product type</option>
                  <option value="Foods">Foods</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Beauty Products">Beauty Products</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Quantity Stock</label>
                <input type="text" value={form.quantityStock} onChange={(e)=>setForm({...form, quantityStock: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm placeholder:text-slate-300 outline-none" placeholder="Total numbers of Stock available" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">MRP</label>
                <input type="text" value={form.mrp} onChange={(e)=>setForm({...form, mrp: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm placeholder:text-slate-300 outline-none" placeholder="Total numbers of Stock available" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Selling Price</label>
                <input type="text" value={form.sellingPrice} onChange={(e)=>setForm({...form, sellingPrice: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm placeholder:text-slate-300 outline-none" placeholder="Total numbers of Stock available" />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Brand Name</label>
                <input type="text" value={form.brandName} onChange={(e)=>setForm({...form, brandName: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm placeholder:text-slate-300 outline-none" placeholder="Total numbers of Stock available" />
              </div>

              {/* UPLOAD SECTION */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-500">Upload Product Images</label>
                  <label htmlFor="file-input" className="text-[10px] font-bold text-slate-700 underline cursor-pointer hover:text-blue-600 transition-colors">Add More Photos</label>
                </div>
                
                <input id="file-input" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />

                <div className="w-full border border-dashed border-slate-300 rounded-lg p-3 min-h-[90px] flex items-center justify-center transition-all bg-white hover:bg-slate-50">
                  {form.images.length === 0 ? (
                    <label htmlFor="file-input" className="flex flex-col items-center justify-center cursor-pointer py-2">
                      <span className="text-slate-400 text-[11px] font-medium mb-1 tracking-tight">Enter Description</span>
                      <span className="text-slate-700 font-bold text-[13px]">Browse</span>
                    </label>
                  ) : (
                    <div className="flex flex-wrap gap-2.5 w-full">
                      {form.images.map((img, idx) => (
                        <div key={idx} className="w-16 h-16 rounded border border-slate-100 p-1 bg-white relative group">
                          <img src={img} className="w-full h-full object-contain" alt="preview" />
                          <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1.5 -right-1.5 bg-white text-slate-400 border border-slate-200 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shadow-sm hover:text-red-500 transition-all">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block">Exchange or return eligibility</label>
                <select value={form.isReturnable} onChange={(e)=>setForm({...form, isReturnable: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm text-slate-400 bg-white outline-none cursor-pointer">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </form>

            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <button onClick={handleSaveProduct} disabled={loading} className="bg-[#1D35D9] text-white px-10 py-2.5 rounded-md font-bold text-xs shadow-md active:scale-95 transition-all">
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-white border border-slate-100 rounded-lg shadow-xl px-6 py-3 flex items-center gap-3">
                <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs shadow-sm shadow-emerald-200">✓</span>
                <span className="text-slate-700 font-bold text-sm tracking-tight">Product added Successfully</span>
                <button onClick={() => setShowToast(false)} className="text-slate-400 text-lg ml-2 hover:text-slate-600 transition-colors">×</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;