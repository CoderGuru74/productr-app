import React, { useState, useEffect } from 'react';
import logo from '../assets/Frame 4.png';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('Home'); 
  const [activeTab, setActiveTab] = useState('Published'); 
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [productToDelete, setProductToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const [form, setForm] = useState({
    name: '', category: 'Foods', quantityStock: '', mrp: '', sellingPrice: '', brandName: '', isReturnable: 'Yes', images: []
  });

  const userEmail = "pixelnodeofficial@gmail.com"; 

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/products/${userEmail}`);
      const data = await response.json();
      setProducts(data);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { fetchProducts(); }, []);

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
        fetchProducts(); 
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) { alert("Update failed"); }
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/products/${productToDelete._id}`, { method: 'DELETE' });
      if (response.ok) {
        setShowDeleteModal(false);
        fetchProducts();
        setToastMsg('Product deleted Successfully');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) { alert("Delete failed"); }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setForm({ ...product });
    setShowModal(true);
  };

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
          setForm(prev => ({ ...prev, images: [...prev.images, compressedBase64] }));
        };
      };
    });
  };

  const handleSaveOrUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = editingProduct ? `http://localhost:5000/products/${editingProduct._id}` : 'http://localhost:5000/products';
    const method = editingProduct ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userEmail }),
      });
      if (response.ok) {
        setShowModal(false);
        setEditingProduct(null);
        setForm({ name: '', category: 'Foods', quantityStock: '', mrp: '', sellingPrice: '', brandName: '', isReturnable: 'Yes', images: [] });
        fetchProducts();
        setToastMsg(editingProduct ? 'Product updated Successfully' : 'Product added Successfully');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) { alert("Error saving"); }
    finally { setLoading(false); }
  };

  const displayProducts = view === 'Home' 
    ? products.filter(p => p.status === activeTab) 
    : products;

  return (
    <div className="flex h-screen bg-[#F0F2F5] font-sans overflow-hidden">
      <aside className="w-64 bg-[#1E2129] text-white flex flex-col p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-8"><img src={logo} alt="Productr" className="h-7" /></div>
        <nav className="space-y-4">
          <div onClick={() => setView('Home')} className={`flex items-center gap-3 p-2 cursor-pointer rounded-lg transition-all ${view === 'Home' ? 'bg-blue-600/10 border-l-4 border-blue-600 font-bold text-white' : 'text-gray-400'}`}>
            <span>🏠</span> Home
          </div>
          <div onClick={() => setView('Products')} className={`flex items-center gap-3 p-2 cursor-pointer rounded-lg transition-all ${view === 'Products' ? 'bg-blue-600/10 border-l-4 border-blue-600 font-bold text-white' : 'text-gray-400'}`}>
            <span>📦</span> Products
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
          {view === 'Home' ? (
            <div className="flex gap-8 h-full">
              {['Published', 'Unpublished'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`text-sm font-bold h-full border-b-2 transition-all px-2 ${activeTab === tab ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}>
                  {tab}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm font-bold text-blue-600">All Products Inventory</div>
          )}
          <button onClick={() => {setEditingProduct(null); setForm({ name: '', category: 'Foods', quantityStock: '', mrp: '', sellingPrice: '', brandName: '', isReturnable: 'Yes', images: [] }); setShowModal(true);}} className="text-gray-600 font-bold text-[13px] hover:text-blue-700">
            + Add Products
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">
            {view === 'Home' ? `${activeTab} Section` : 'Full Product Catalog'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all">
                <div className="p-4 bg-[#F8F9FA] h-52 flex items-center justify-center relative">
                  <div className="w-44 h-44 bg-white rounded-lg shadow-sm p-3 flex items-center justify-center relative">
                    <img src={p.images?.[0] || "https://via.placeholder.com/150"} alt="product" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-800 text-[15px] mb-4 truncate">{p.name}</h3>
                  <div className="space-y-1.5 text-[12px] text-slate-500 font-bold">
                    <div className="flex justify-between"><span>Product Type -</span><span className="text-slate-800">{p.category}</span></div>
                    <div className="flex justify-between"><span>Quantity Stock -</span><span className="text-slate-800">{p.quantityStock}</span></div>
                    <div className="flex justify-between"><span>MRP -</span><span className="text-slate-800">₹ {p.mrp}</span></div>
                    <div className="flex justify-between"><span>Selling Price -</span><span className="text-slate-800">₹ {p.sellingPrice}</span></div>
                    <div className="flex justify-between"><span>Brand Name -</span><span className="text-slate-800">{p.brandName}</span></div>
                    <div className="flex justify-between pt-2 mt-2 border-t border-slate-50">
                      <span>Exchange Eligibility -</span>
                      <span className="text-slate-800">.{p.isReturnable.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button 
                      onClick={() => togglePublishStatus(p)} 
                      className={`flex-1 py-2 rounded-md font-bold text-xs text-white ${p.status === 'Published' ? 'bg-[#00D261]' : 'bg-[#1D35D9]'}`}
                    >
                      {p.status === 'Published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => handleEditClick(p)} className="flex-1 border border-slate-200 py-2 rounded-md font-bold text-slate-700 text-xs">Edit</button>
                    <button onClick={() => openDeleteModal(p)} className="w-10 border border-slate-200 rounded-md flex items-center justify-center text-slate-400">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* DELETE MODAL WITH CLOSE ICON */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-lg w-full max-w-[440px] shadow-2xl p-6 relative">
            {/* CLOSE ICON (Upper Right) */}
            <button 
              onClick={() => setShowDeleteModal(false)} 
              className="absolute top-4 right-4 text-slate-400 text-2xl font-light hover:text-slate-600 leading-none"
            >
              ×
            </button>
            
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Delete Product</h2>
            <p className="text-slate-500 text-[15px] mb-10">
              Are you sure you really want to delete this Product <br />
              <span className="font-bold text-slate-700">“ {productToDelete?.name} ” ?</span>
            </p>
            <div className="flex justify-end">
              <button 
                onClick={handleDeleteProduct} 
                className="bg-[#1D35D9] text-white px-10 py-2.5 rounded-md font-bold text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg w-full max-w-[420px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-lg">
              <h2 className="text-sm font-bold text-slate-600">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => {setShowModal(false); setEditingProduct(null);}} className="text-slate-400 text-xl font-light">×</button>
            </div>
            <form onSubmit={handleSaveOrUpdate} className="p-6 space-y-4 overflow-y-auto">
              {/* Form inputs (Name, Category, Stock, MRP, Price, Brand, Upload, Eligibility) */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Product Name</label>
                <input type="text" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm outline-none" placeholder="CakeZone Walnut Brownie" required />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Product Type</label>
                <select value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm bg-white outline-none">
                  <option value="Foods">Foods</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Beauty Products">Beauty Products</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Quantity Stock</label>
                <input type="text" value={form.quantityStock} onChange={(e)=>setForm({...form, quantityStock: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm outline-none" placeholder="Total numbers of Stock available" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">MRP</label>
                <input type="text" value={form.mrp} onChange={(e)=>setForm({...form, mrp: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm outline-none" placeholder="Total numbers of Stock available" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Selling Price</label>
                <input type="text" value={form.sellingPrice} onChange={(e)=>setForm({...form, sellingPrice: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm outline-none" placeholder="Total numbers of Stock available" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Brand Name</label>
                <input type="text" value={form.brandName} onChange={(e)=>setForm({...form, brandName: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm outline-none" placeholder="Total numbers of Stock available" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Upload Product Images</label>
                  <label htmlFor="file-input" className="text-[10px] font-bold text-slate-700 underline cursor-pointer hover:text-blue-600">Add More Photos</label>
                </div>
                <input id="file-input" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                <div className="w-full border border-dashed border-slate-300 rounded-lg p-3 min-h-[90px] flex items-center justify-center bg-white">
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
                          <button type="button" onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))} className="absolute -top-1.5 -right-1.5 bg-white text-slate-400 border border-slate-200 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shadow-sm">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Exchange or return eligibility</label>
                <select value={form.isReturnable} onChange={(e)=>setForm({...form, isReturnable: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm bg-white outline-none">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </form>
            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <button onClick={handleSaveOrUpdate} className="bg-[#1D35D9] text-white px-10 py-2.5 rounded-md font-bold text-xs">
                {editingProduct ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-white border rounded-lg shadow-xl px-6 py-3 flex items-center gap-3">
            <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
            <span className="text-slate-700 font-bold text-sm tracking-tight">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default Home;