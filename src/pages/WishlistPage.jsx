import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function WishlistPage() {
  const { wishlist, products, toggleWishlist } = useAppContext();
  
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Favorites</h1>
      
      {wishlistProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-slate-500 mb-6">Items added to your favorites will be saved here.</p>
          <Link to="/shop" className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {wishlistProducts.map(product => (
            <div key={product.id} className="group relative">
              <div className="bg-slate-100 aspect-[4/5] overflow-hidden rounded-md">
                <Link to={`/product/${product.id}`}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover object-center group-hover:opacity-90 transition-opacity" />
                </Link>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-sm hover:scale-110 active:scale-95 transition-all z-10"
                  title="Remove from favorites"
                  aria-label="Remove from favorites"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </button>
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <Link to={`/product/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
