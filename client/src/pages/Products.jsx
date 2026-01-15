import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import productIcon from '../assets/Icon.png'; 

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [productToDelete, setProductToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const [activeImageIndices, setActiveImageIndices] = useState({});
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '', category: 'Foods', quantityStock: '', mrp: '', sellingPrice: '', brandName: '', isReturnable: 'Yes', images: []
  });

  // 🚩 DYNAMIC URL LOGIC: Fix for deployment
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://productr-app.onrender.com';

  const userEmail = localStorage.getItem('userEmail'); 

  const fetchProducts = async () => {
    if (!userEmail) return; 
    try {
      // Using API_BASE_URL instead of fixed localhost
      const response = await fetch(`${API_BASE_URL}/products/${userEmail}`);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Fetch error:", err); 
    }
  };

  useEffect(() => { 
    fetchProducts(); 
  }, [userEmail]);

  const validateForm = () => {
    let tempErrors = {};
    if (!form.name) tempErrors.name = "Please add product name";
    if (!form.quantityStock) tempErrors.quantityStock = "Please add quantity stock";
    if (!form.mrp) tempErrors.mrp = "Please add MRP";
    if (!form.sellingPrice) tempErrors.sellingPrice = "Please add selling price";
    if (!form.brandName) tempErrors.brandName = "Please add brand name";
    if (form.images.length === 0) tempErrors.images = "Please upload at least one image";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.brandName && p.brandName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const togglePublishStatus = async (product) => {
    const newStatus = product.status === 'Published' ? 'Unpublished' : 'Published';
    try {
      const response = await fetch(`${API_BASE_URL}/products/${product._id}/status`, {
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

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productToDelete._id}`, { method: 'DELETE' });
      if (response.ok) {
        setShowDeleteModal(false);
        fetchProducts(); 
        setToastMsg('Product deleted Successfully');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) { alert("Delete failed"); }
  };

  const handleSaveOrUpdate = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const url = editingProduct ? `${API_BASE_URL}/products/${editingProduct._id}` : `${API_BASE_URL}/products`;
    const method = editingProduct ? 'PUT' : 'POST';

    const payload = {
      ...form,
      userEmail,
      mrp: Number(form.mrp),
      sellingPrice: Number(form.sellingPrice),
      status: editingProduct ? (form.status || 'Unpublished') : 'Unpublished'
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setShowModal(false);
        fetchProducts(); 
        setToastMsg(editingProduct ? 'Product updated Successfully' : 'Product added Successfully');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert("Server rejected the request. Checking logs...");
      }
    } catch (err) { alert("Error saving"); }
    finally { setLoading(false); }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setForm({ ...product });
    setErrors({});
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingProduct(null); 
    setForm({ name: '', category: 'Foods', quantityStock: '', mrp: '', sellingPrice: '', brandName: '', isReturnable: 'Yes', images: [] }); 
    setErrors({});
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
          // 🚩 FIX: Lower quality (0.4) for smaller Base64 strings to avoid 500 errors
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.4);
          setForm(prev => ({ ...prev, images: [...prev.images, compressedBase64] }));
          if (errors.images) setErrors(prev => ({ ...prev, images: null }));
        };
      };
    });
  };

  const handleDotClick = (productId, index) => {
    setActiveImageIndices(prev => ({ ...prev, [productId]: index }));
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-w-0 bg-white relative">
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <header className="bg-white border-b border-slate-100 flex-shrink-0 h-14 mt-14 z-10">
          <div className="h-full flex items-center justify-between px-8">
            <div className="flex items-center gap-2 text-[18px] font-bold text-[#445069]">
               <img src={productIcon} alt="Icon" className="w-5 h-5" /> Products
            </div>
            <button onClick={openAddModal} className="flex items-center gap-2 text-[#445069] font-medium text-[18px] hover:text-[#1D35D9] transition-colors">
                <span className="text-[22px] font-light text-[#94a3b8]">+</span> Add Products
            </button>
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
              <h2 className="text-[#445069] text-xl font-bold mb-2">Feels a little empty over here...</h2>
              <p className="text-[#94a3b8] text-sm max-w-sm mb-8 leading-relaxed">You can create products without connecting store <br /> you can add products to store anytime</p>
              <button onClick={openAddModal} className="bg-[#001D9D] text-white px-20 py-3 rounded-lg font-bold text-sm shadow-md">Add your Products</button>
            </div>
          ) : (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((p) => {
                const currentIdx = activeImageIndices[p._id] || 0;
                return (
                  <div key={p._id} className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col w-full hover:shadow-lg transition-shadow">
                    <div className="p-4 bg-white h-[220px] flex flex-col items-center justify-center relative">
                      <div className="w-full h-full border rounded-xl p-2 flex items-center justify-center relative overflow-hidden">
                        <img src={p.images?.[currentIdx] || "https://via.placeholder.com/150"} alt={p.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex gap-1.5 mt-3 justify-center">
                        {(p.images?.length > 1 ? p.images : [1]).map((_, idx) => (
                          <button key={idx} onClick={() => p.images && handleDotClick(p._id, idx)} className={`w-1.5 h-1.5 rounded-full transition-all ${currentIdx === idx ? 'bg-orange-500 w-3' : 'bg-slate-200'}`} />
                        ))}
                      </div>
                    </div>

                    <div className="p-6 pt-0 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 text-[15px] mb-4 truncate">{p.name}</h3>
                      <div className="space-y-2 text-[12px] font-bold text-slate-400">
                        <div className="flex justify-between items-baseline"><span>Product type -</span><div className="flex-grow border-b border-dotted border-slate-200 mx-2 self-center"></div><span className="text-slate-800 font-medium">{p.category}</span></div>
                        <div className="flex justify-between items-baseline"><span>Quantity Stock -</span><div className="flex-grow border-b border-dotted border-slate-200 mx-2 self-center"></div><span className="text-slate-800 font-medium">{p.quantityStock}</span></div>
                        <div className="flex justify-between items-baseline"><span>MRP-</span><div className="flex-grow border-b border-dotted border-slate-200 mx-2 self-center"></div><span className="text-slate-800 font-medium">₹ {p.mrp}</span></div>
                        <div className="flex justify-between items-baseline"><span>Selling Price -</span><div className="flex-grow border-b border-dotted border-slate-200 mx-2 self-center"></div><span className="text-slate-800 font-medium">₹ {p.sellingPrice}</span></div>
                        <div className="flex justify-between items-baseline"><span>Brand Name -</span><div className="flex-grow border-b border-dotted border-slate-200 mx-2 self-center"></div><span className="text-slate-800 font-medium">{p.brandName}</span></div>
                        <div className="flex justify-between items-baseline pt-2 mt-2 border-t border-slate-50"><span>Exchange Eligibility -</span><div className="flex-grow border-b border-dotted border-slate-200 mx-2 self-center"></div><span className="text-slate-800 font-medium">.{p.isReturnable.toUpperCase()}</span></div>
                      </div>

                      <div className="flex gap-2 mt-6">
                        <button onClick={() => togglePublishStatus(p)} className={`flex-1 py-2 rounded-lg font-bold text-xs text-white shadow-sm transition-all active:scale-95 ${p.status === 'Published' ? 'bg-[#1D35D9]' : 'bg-[#FF6D00]'}`}>{p.status === 'Published' ? 'Unpublish' : 'Publish'}</button>
                        <button onClick={() => handleEditClick(p)} className="flex-1 border border-slate-200 py-2 rounded-lg font-bold text-slate-700 text-xs hover:bg-slate-50 shadow-sm">Edit</button>
                        <button onClick={() => { setProductToDelete(p); setShowDeleteModal(true); }} className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500">🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-lg w-full max-w-[440px] shadow-2xl p-6 relative">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-slate-400 text-2xl font-light leading-none">×</button>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Delete Product</h2>
            <p className="text-slate-500 text-[15px] mb-10 leading-relaxed">Are you sure you really want to delete this Product <br /><span className="font-bold text-slate-700">“ {productToDelete?.name} ” ?</span></p>
            <div className="flex justify-end"><button onClick={handleDeleteProduct} className="bg-[#1D35D9] text-white px-10 py-2.5 rounded-md font-bold text-sm">Delete</button></div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-lg w-full max-w-[420px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-lg">
              <h2 className="text-sm font-bold text-slate-600">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => {setShowModal(false); setErrors({});}} className="text-slate-400 text-xl font-light">×</button>
            </div>
            <form onSubmit={handleSaveOrUpdate} className="p-6 space-y-4 overflow-y-auto">
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Product Name</label>
                <input type="text" value={form.name} onChange={(e)=>{setForm({...form, name: e.target.value}); if(errors.name) setErrors({...errors, name: null})}} className={`w-full p-2.5 rounded-md border ${errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200'} text-sm outline-none`} placeholder="CakeZone Walnut Brownie" />
                {errors.name && <span className="text-red-500 text-[10px] mt-1 font-bold">{errors.name}</span>}
              </div>
              <div className="flex flex-col"><label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Product Type</label><select value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm bg-white outline-none"><option value="Foods">Foods</option><option value="Electronics">Electronics</option></select></div>
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Quantity Stock</label>
                <input type="text" value={form.quantityStock} onChange={(e)=>{setForm({...form, quantityStock: e.target.value}); if(errors.quantityStock) setErrors({...errors, quantityStock: null})}} className={`w-full p-2.5 rounded-md border ${errors.quantityStock ? 'border-red-500 bg-red-50' : 'border-slate-200'} text-sm outline-none`} placeholder="Total stock" />
                {errors.quantityStock && <span className="text-red-500 text-[10px] mt-1 font-bold">{errors.quantityStock}</span>}
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">MRP</label>
                <input type="text" value={form.mrp} onChange={(e)=>{setForm({...form, mrp: e.target.value}); if(errors.mrp) setErrors({...errors, mrp: null})}} className={`w-full p-2.5 rounded-md border ${errors.mrp ? 'border-red-500 bg-red-50' : 'border-slate-200'} text-sm outline-none`} placeholder="₹" />
                {errors.mrp && <span className="text-red-500 text-[10px] mt-1 font-bold">{errors.mrp}</span>}
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Selling Price</label>
                <input type="text" value={form.sellingPrice} onChange={(e)=>{setForm({...form, sellingPrice: e.target.value}); if(errors.sellingPrice) setErrors({...errors, sellingPrice: null})}} className={`w-full p-2.5 rounded-md border ${errors.sellingPrice ? 'border-red-500 bg-red-50' : 'border-slate-200'} text-sm outline-none`} placeholder="₹" />
                {errors.sellingPrice && <span className="text-red-500 text-[10px] mt-1 font-bold">{errors.sellingPrice}</span>}
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Brand Name</label>
                <input type="text" value={form.brandName} onChange={(e)=>{setForm({...form, brandName: e.target.value}); if(errors.brandName) setErrors({...errors, brandName: null})}} className={`w-full p-2.5 rounded-md border ${errors.brandName ? 'border-red-500 bg-red-50' : 'border-slate-200'} text-sm outline-none`} placeholder="Brand" />
                {errors.brandName && <span className="text-red-500 text-[10px] mt-1 font-bold">{errors.brandName}</span>}
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Upload Images</label><label htmlFor="file-input" className="text-[10px] font-bold text-slate-700 underline cursor-pointer">Add Photos</label></div>
                <input id="file-input" type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                <div className={`w-full border border-dashed ${errors.images ? 'border-red-500 bg-red-50' : 'border-slate-300'} rounded-lg p-3 min-h-[90px] flex items-center justify-center bg-white`}>
                  {form.images.length === 0 ? <label htmlFor="file-input" className="cursor-pointer py-2 flex flex-col items-center"><span className="text-slate-400 text-[11px]">Browse</span></label> : <div className="flex flex-wrap gap-2.5 w-full">{form.images.map((img, idx) => (<div key={idx} className="w-16 h-16 rounded border border-slate-100 p-1 bg-white relative group"><img src={img} className="w-full h-full object-contain" alt="preview" /><button type="button" onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))} className="absolute -top-1.5 -right-1.5 bg-white text-slate-400 border border-slate-200 w-4 h-4 rounded-full flex items-center justify-center text-[10px] shadow-sm">×</button></div>))}</div>}
                </div>
                {errors.images && <span className="text-red-500 text-[10px] mt-1 font-bold">{errors.images}</span>}
              </div>
              <div className="flex flex-col"><label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Exchange Eligibility</label><select value={form.isReturnable} onChange={(e)=>setForm({...form, isReturnable: e.target.value})} className="w-full p-2.5 rounded-md border border-slate-200 text-sm bg-white outline-none"><option value="Yes">Yes</option><option value="No">No</option></select></div>
              {/* Submission Button inside the form to trigger logic */}
              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-[#1D35D9] text-white px-10 py-2.5 rounded-md font-bold text-xs shadow-md active:scale-95 transition-all">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-10 right-10 z-[250] bg-white border border-slate-100 rounded-lg shadow-xl px-6 py-3 flex items-center gap-3 animate-in slide-in-from-right-5">
            <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
            <span className="text-slate-700 font-bold text-sm tracking-tight">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default Products;