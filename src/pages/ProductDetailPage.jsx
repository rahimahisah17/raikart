import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, wishlist } = useAppContext();
  
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product]);

  if (!product) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found.</h2>
        <Link to="/shop" className="bg-black text-white px-6 py-2 rounded-full font-bold">
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    const finalSize = selectedSize || product.sizes?.[0] || 'M';
    const finalColor = selectedColor || product.colors?.[0] || 'Default';

    addToCart(product.id, finalSize, finalColor, 1);
    
    setToastMessage(`Added "${product.name}" (${finalColor} / ${finalSize}) to your bag!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-bounce border border-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              to="/cart" 
              className="text-xs font-black uppercase tracking-wider bg-[#fed7aa] text-black px-3.5 py-1.5 rounded-full hover:bg-white transition-colors"
            >
              View Bag &rarr;
            </Link>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Image */}
        <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#ffedd5]/50 border border-[#fdba74]/50 shadow-sm relative">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center" />
        </div>

        {/* Product info */}
        <div className="mt-10 px-4 sm:px-0 lg:mt-0 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-black">{product.name}</h1>
            <div className="mt-3">
              <p className="text-3xl font-black tracking-tight text-gray-900">${product.price}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500 uppercase tracking-wider">{product.category}</p>
            </div>

            <div className="mt-6">
              <div className="text-base text-slate-700 space-y-4 leading-relaxed font-medium">
                <p>{product.description}</p>
              </div>
            </div>

            <form className="mt-8" onSubmit={(e) => e.preventDefault()}>
              {/* Colors */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Color</h3>
                  <span className="text-xs font-bold text-slate-500">{selectedColor || product.colors?.[0]}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border text-xs font-extrabold rounded-xl transition-all ${
                        (selectedColor || product.colors?.[0]) === color 
                          ? 'border-black bg-black text-white shadow-md' 
                          : 'border-[#fdba74]/60 bg-[#ffedd5]/60 text-slate-900 hover:bg-[#fed7aa]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Size</h3>
                  <span className="text-xs font-bold text-slate-500">{selectedSize || product.sizes?.[0]}</span>
                </div>
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`border rounded-xl py-3 px-4 flex items-center justify-center text-xs font-black uppercase transition-all ${
                        (selectedSize || product.sizes?.[0]) === size 
                          ? 'border-black bg-black text-white shadow-md' 
                          : 'border-[#fdba74]/60 bg-[#ffedd5]/60 text-slate-900 hover:bg-[#fed7aa]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex space-x-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-black border border-transparent rounded-full py-4 px-8 flex items-center justify-center text-sm font-extrabold uppercase tracking-wider text-white hover:bg-slate-800 focus:outline-none active:scale-95 transition-all shadow-md"
                >
                  Add to bag
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`rounded-full py-4 px-6 flex items-center justify-center gap-2 border font-bold transition-all ${
                    wishlist.includes(product.id) 
                      ? 'border-red-500 bg-red-50 text-red-600 shadow-sm' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label={wishlist.includes(product.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={wishlist.includes(product.id) ? "#ef4444" : "none"} stroke={wishlist.includes(product.id) ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                  <span className="text-xs font-extrabold uppercase">{wishlist.includes(product.id) ? "Saved" : "Favorite"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
