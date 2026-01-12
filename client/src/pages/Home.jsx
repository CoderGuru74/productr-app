import React, { useState, useEffect } from 'react';
import logo from '../assets/Frame 4.png';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Published'); // Controlled at Home level
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

  // Toggle status and refresh list to move item between sections
  const togglePublishStatus = async (product) => {
    const newStatus = product.status === 'Published' ? 'Unpublished' : 'Published';
    try {
      const response = await fetch(`http://localhost:5000/products/${product._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setToastMsg(`Product moved to ${newStatus}`);
        setShowToast(true);
        fetchProducts(); 
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) { alert("Failed to update status."); }
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/products/${productToDelete._id}`, {
        method: 'DELETE',
      });
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
        fetchProducts();
        setToastMsg(editingProduct ? 'Updated Successfully' : 'Added Successfully');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) { alert("Error saving"); }
    finally { setLoading(false); }
  };

  // Filter products for the current active section
  const filteredProducts = products.filter(p => p.status === activeTab);

  return (
    <div className="flex h-screen bg-[#F0F2F5] font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1E2129] text-white flex flex-col p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-8"><img src={logo} alt="Productr" className="h-7" /></div>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-white bg-blue-600/10 p-2 cursor-pointer rounded-lg border-l-4 border-blue-600 font-bold text-sm"><span>🏠</span> Home</div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER TABS - Controlled in Home */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
          <div className="flex gap-8 h-full">
            {['Published', 'Unpublished'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold h-full border-b-2 transition-all px-2 ${activeTab === tab ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button onClick={() => {setEditingProduct(null); setShowModal(true);}} className="text-gray-600 font-bold text-[13px] hover:text-blue-700">+ Add Products</button>
        </header>

        {/* SECTION GRID */}
        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">{activeTab} Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all">
                <div className="p-4 bg-[#F8F9FA] h-52 flex items-center justify-center">
                  <div className="w-44 h-44 bg-white rounded-lg shadow-sm p-3 flex items-center justify-center">
                    <img src={p.images?.[0] || "https://via.placeholder.com/150"} alt="product" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 truncate">{p.name}</h3>
                  <div className="space-y-1 text-[11px] text-slate-500 font-bold">
                    <div className="flex justify-between"><span>MRP -</span><span className="text-slate-800">₹ {p.mrp}</span></div>
                    <div className="flex justify-between"><span>Selling Price -</span><span className="text-slate-800">₹ {p.sellingPrice}</span></div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button 
                      onClick={() => togglePublishStatus(p)}
                      className={`flex-1 py-2 rounded-md font-bold text-xs text-white ${p.status === 'Published' ? 'bg-orange-500' : 'bg-[#1D35D9]'}`}
                    >
                      {p.status === 'Published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => handleEditClick(p)} className="flex-1 border border-slate-200 py-2 rounded-md font-bold text-slate-700 text-xs">Edit</button>
                    <button onClick={() => openDeleteModal(p)} className="w-10 border border-slate-200 rounded-md text-slate-400">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg w-full max-w-[440px] shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Delete Product</h2>
            <p className="text-slate-500 text-[15px] mb-10 leading-relaxed">
              Are you sure you really want to delete this Product <br />
              <span className="font-bold text-slate-700">“ {productToDelete?.name} ” ?</span>
            </p>
            <div className="flex justify-end">
              <button onClick={handleDeleteProduct} className="bg-[#1D35D9] text-white px-10 py-2.5 rounded-md font-bold text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-[420px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-600">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 text-xl">×</button>
            </div>
            <form onSubmit={handleSaveOrUpdate} className="p-6 space-y-4 overflow-y-auto">
                {/* (Keep standard form fields from previous version here) */}
                <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Product Name</label>
                    <input type="text" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="w-full p-2.5 rounded-md border text-sm" required />
                </div>
                {/* ... (MRP, Selling Price, etc.) */}
            </form>
            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <button type="submit" onClick={handleSaveOrUpdate} className="bg-[#1D35D9] text-white px-10 py-2.5 rounded-md font-bold text-xs">
                {editingProduct ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-white border rounded-lg shadow-xl px-6 py-3 flex items-center gap-3">
            <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
            <span className="text-slate-700 font-bold text-sm">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default Home;