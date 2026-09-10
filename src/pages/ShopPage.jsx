import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function ShopPage() {
  const { products, toggleWishlist, wishlist, addToCart } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [sortBy, setSortBy] = useState('featured');
  const [toastMessage, setToastMessage] = useState(null);

  // Quick Add Modal state
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const cleanQuery = query.toLowerCase().trim();
  const normalizedQuery = cleanQuery.replace(/['’]/g, '');

  const filteredProducts = products.filter(p => {
    if (!cleanQuery) return true;

    const cat = p.category.toLowerCase();
    const name = p.name.toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const colors = (p.colors || []).map(c => c.toLowerCase()).join(' ');

    const isWomenItem = cat.includes('women') || name.includes('women') || p.gender === 'women';
    const isMenItem = (cat.includes("men's") || cat.startsWith("men ") || name.includes("men's") || p.gender === 'men') && !isWomenItem;

    if (
      normalizedQuery === 'men' || 
      normalizedQuery === 'mens' || 
      normalizedQuery === 'mens apparel' || 
      normalizedQuery === 'men apparel' ||
      normalizedQuery === 'mens collection' ||
      normalizedQuery === 'man' ||
      normalizedQuery === 'male'
    ) {
      return isMenItem || (p.gender === 'unisex' && !isWomenItem);
    }

    if (
      normalizedQuery === 'women' || 
      normalizedQuery === 'womens' || 
      normalizedQuery === 'womens collection' || 
      normalizedQuery === 'women collection' ||
      normalizedQuery === 'womens apparel' ||
      normalizedQuery === 'woman' ||
      normalizedQuery === 'female'
    ) {
      return isWomenItem;
    }

    if (normalizedQuery === 'shoes' || normalizedQuery === 'footwear' || normalizedQuery === 'sneakers') {
      return cat.includes('shoe') || cat.includes('runner') || name.includes('shoe') || name.includes('runner') || name.includes('sneaker');
    }

    const words = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
    const queryHasMen = words.some(w => w === 'men' || w === 'mens');
    const queryHasWomen = words.some(w => w === 'women' || w === 'womens');

    if (queryHasMen && !queryHasWomen && isWomenItem) {
      return false;
    }

    if (queryHasWomen && !queryHasMen && !isWomenItem) {
      return false;
    }

    const combined = `${name} ${cat} ${desc} ${colors}`.replace(/['’]/g, '');

    return words.every(word => {
      if (word === 'men' || word === 'mens') {
        return (/\bmen('?s)?\b/i.test(combined) || p.gender === 'men') && !isWomenItem;
      }
      if (word === 'women' || word === 'womens') {
        return /\bwomen('?s)?\b/i.test(combined) || p.gender === 'women';
      }
      return combined.includes(word);
    });
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // featured
  });

  const handleInlineSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('q')?.toString().trim() || '';
    if (q) {
      setSearchParams({ q });
    } else {
      setSearchParams({});
    }
  };

  const openQuickAdd = (product) => {
    setQuickAddProduct(product);
    setSelectedSize(product.sizes?.[0] || 'M');
    setSelectedColor(product.colors?.[0] || 'Default');
  };

  const handleConfirmQuickAdd = () => {
    if (!quickAddProduct) return;
    addToCart(quickAddProduct.id, selectedSize, selectedColor, 1);
    const addedName = quickAddProduct.name;
    setQuickAddProduct(null);

    setToastMessage(`Added "${addedName}" to your bag!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-6 py-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
          <Link to="/cart" className="text-xs font-bold bg-[#fed7aa] text-black px-3 py-1.5 rounded-full hover:bg-white transition-colors">
            View Bag &rarr;
          </Link>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-[#fdba74]/40">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">
            {query ? `Search Results for "${query}"` : 'All Products'}
          </h1>
          <p className="text-slate-600 font-bold mt-2 text-base">
            Showing <span className="text-black bg-[#ffedd5] border border-[#fdba74]/50 px-3 py-1 rounded-full">{sortedProducts.length} Results</span>
          </p>
        </div>

        {/* Search Control Bar */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <form onSubmit={handleInlineSearch} className="flex items-center bg-[#ffedd5] border border-[#fdba74]/60 rounded-full px-4 py-2 w-full sm:w-80 shadow-sm focus-within:ring-2 focus-within:ring-black">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              key={query}
              type="text" 
              name="q"
              defaultValue={query} 
              placeholder="Search items, categories..." 
              className="bg-transparent border-none outline-none text-sm w-full text-black placeholder:text-slate-500 font-medium"
            />
            {query && (
              <button 
                type="button" 
                onClick={() => setSearchParams({})} 
                className="text-xs text-slate-600 hover:text-black font-bold ml-1 px-2 py-0.5 rounded-full bg-[#fed7aa]"
              >
                Clear
              </button>
            )}
            <button type="submit" className="ml-2 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-slate-800 transition-colors shrink-0">
              Search
            </button>
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center bg-[#ffedd5] border border-[#fdba74]/60 rounded-full px-3 py-2 text-xs font-bold">
            <span className="text-slate-500 mr-1 shrink-0">Sort:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-black font-bold"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Quick Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button 
          onClick={() => setSearchParams({})}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!query ? 'bg-black text-white shadow' : 'bg-[#ffedd5] text-black border border-[#fdba74] hover:bg-[#fed7aa]'}`}
        >
          All Items
        </button>
        <button 
          onClick={() => setSearchParams({ q: "Women's Training Top" })}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${query.toLowerCase().includes('training top') ? 'bg-black text-white shadow' : 'bg-[#ffedd5] text-black border border-[#fdba74] hover:bg-[#fed7aa]'}`}
        >
          Women's Training Top (24)
        </button>
        <button 
          onClick={() => setSearchParams({ q: "Women" })}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${query.toLowerCase() === 'women' ? 'bg-black text-white shadow' : 'bg-[#ffedd5] text-black border border-[#fdba74] hover:bg-[#fed7aa]'}`}
        >
          Women's Collection
        </button>
        <button 
          onClick={() => setSearchParams({ q: "Men" })}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${query.toLowerCase() === 'men' ? 'bg-black text-white shadow' : 'bg-[#ffedd5] text-black border border-[#fdba74] hover:bg-[#fed7aa]'}`}
        >
          Men's Apparel
        </button>
        <button 
          onClick={() => setSearchParams({ q: "Shoes" })}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${query.toLowerCase() === 'shoes' ? 'bg-black text-white shadow' : 'bg-[#ffedd5] text-black border border-[#fdba74] hover:bg-[#fed7aa]'}`}
        >
          Footwear
        </button>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-20 bg-[#ffedd5]/40 rounded-2xl border border-[#fdba74]">
          <p className="text-xl font-medium text-slate-600">No products found matching your search.</p>
          <Link to="/shop" className="mt-4 inline-block rounded-full bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors">
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {sortedProducts.map(product => (
            <div key={product.id} className="group relative bg-[#ffedd5]/40 border border-[#fdba74]/50 rounded-xl p-3 transition-shadow hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="bg-[#fed7aa]/50 aspect-[4/5] overflow-hidden rounded-lg relative">
                  <Link to={`/product/${product.id}`}>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" 
                    />
                  </Link>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full bg-white/95 shadow-sm hover:scale-110 active:scale-95 transition-all z-10 ${
                      wishlist.includes(product.id) ? 'ring-2 ring-red-100' : ''
                    }`}
                    aria-label={wishlist.includes(product.id) ? "Remove from favorites" : "Add to favorites"}
                    title={wishlist.includes(product.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill={wishlist.includes(product.id) ? "#ef4444" : "none"} 
                      stroke={wishlist.includes(product.id) ? "#ef4444" : "#475569"} 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="transition-colors duration-200"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  </button>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:underline">
                    <Link to={`/product/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-xs text-gray-600 font-medium">{product.category}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#fdba74]/40 flex items-center justify-between">
                <p className="text-sm font-black text-gray-900">${product.price}</p>
                <button
                  type="button"
                  onClick={() => openQuickAdd(product)}
                  className="bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-full hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
                >
                  Quick Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Add Modal */}
      {quickAddProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fff2e6] border border-[#fdba74] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setQuickAddProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-black text-lg font-bold rounded-full bg-[#ffedd5]"
            >
              &times;
            </button>

            <div className="flex gap-4 items-center mb-6 border-b border-[#fdba74]/50 pb-4">
              <img 
                src={quickAddProduct.image} 
                alt={quickAddProduct.name} 
                className="w-20 h-20 rounded-xl object-cover bg-[#ffedd5] border border-[#fdba74]/40"
              />
              <div>
                <h3 className="font-extrabold text-base text-black">{quickAddProduct.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{quickAddProduct.category}</p>
                <p className="text-base font-black text-black mt-1">${quickAddProduct.price}</p>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {(quickAddProduct.sizes || ['S', 'M', 'L', 'XL']).map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-[#ffedd5] text-black border-[#fdba74]/60 hover:bg-[#fed7aa]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Select Color</label>
              <div className="flex flex-wrap gap-2">
                {(quickAddProduct.colors || ['Black', 'White', 'Navy']).map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      selectedColor === color
                        ? 'bg-black text-white border-black'
                        : 'bg-[#ffedd5] text-black border-[#fdba74]/60 hover:bg-[#fed7aa]'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirmQuickAdd}
              className="w-full bg-black text-white font-extrabold uppercase tracking-wider py-4 rounded-full text-sm hover:bg-slate-800 transition-colors shadow-md"
            >
              Add To Bag &bull; ${quickAddProduct.price}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
