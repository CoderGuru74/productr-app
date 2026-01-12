import React, { useState, useEffect } from 'react';
import logo from '../assets/Frame 4.png';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [loading, setLoading] = useState(false);

  // For now, we hardcode the email. 
  // Later, you can get this from localStorage after a successful login.
  const userEmail = "test@gmail.com"; 

  // 1. Fetch products from MongoDB Atlas on page load
  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/products/${userEmail}`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Handle adding a new product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProductName) return alert("Please enter a product name");

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newProductName, 
          userEmail: userEmail,
          description: "New product description" 
        }),
      });

      if (response.ok) {
        setNewProductName('');
        setShowModal(false);
        fetchProducts(); // Refresh the list
      }
    } catch (err) {
      alert("Failed to save product. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1E2129] text-white flex flex-col p-6">
        <div className="mb-10">
          <img src={logo} alt="Productr Logo" className="h-8 mb-8 object-contain" />
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-[#2C2F36] rounded-lg py-2 px-4 text-sm focus:outline-none border border-transparent focus:border-blue-500" 
            />
          </div>
        </div>
        
        <nav className="space-y-6">
          <div className="flex items-center gap-3 text-blue-400 font-bold cursor-pointer">
            <span className="text-xl">🏠</span> Home
          </div>
          <div className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer transition-colors font-medium">
            <span className="text-xl">📦</span> Products
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10">
          <div className="flex gap-8 text-sm font-bold">
            <span className="text-blue-600 border-b-2 border-blue-600 pb-[26px] cursor-pointer">Published</span>
            <span className="text-gray-400 pb-[26px] cursor-pointer hover:text-gray-600">Unpublished</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-[#000066] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-900 transition-all shadow-md"
            >
              + Add Product
            </button>
            <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=User" alt="profile" />
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-10">
          {products.length === 0 ? (
            /* EMPTY STATE */
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-blue-50 text-[#000066] rounded-[24px] flex items-center justify-center mb-6 shadow-inner">
                <span className="text-5xl font-light">+</span>
              </div>
              <h3 className="text-2xl font-bold text-[#000066] mb-2">No Published Products</h3>
              <p className="text-gray-400 text-center max-w-xs">
                Your Published Products will appear here. Create your first product to publish.
              </p>
            </div>
          ) : (
            /* PRODUCT LIST GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl">📦</div>
                    <span className="bg-green-100 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Published</span>
                  </div>
                  <h4 className="font-bold text-[#000066] text-lg mb-1">{product.name}</h4>
                  <p className="text-gray-400 text-sm line-clamp-2">Created on {new Date(product.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl scale-in-center">
            <h2 className="text-2xl font-bold text-[#000066] mb-2">Add New Product</h2>
            <p className="text-gray-400 text-sm mb-8">Enter the details of your new market entry.</p>
            
            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input 
                  autoFocus
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Nike Air Max"
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#000066] text-white py-4 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg disabled:bg-gray-300"
                >
                  {loading ? "Saving..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;