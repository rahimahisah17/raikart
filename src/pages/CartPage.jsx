import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, products, toggleWishlist, wishlist } = useAppContext();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const trendingProducts = products.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black tracking-tighter uppercase mb-8">BAG</h1>

      {cart.length === 0 ? (
        <div className="space-y-16">
          <div className="text-center py-16 bg-[#ffedd5]/50 border border-[#fdba74]/60 rounded-3xl p-8 max-w-2xl mx-auto">
            <p className="text-lg text-slate-600 font-medium mb-6">There are no items in your bag.</p>
            <Link 
              to="/shop" 
              className="inline-block bg-black text-white px-10 py-3.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-colors shadow-md"
            >
              Shop Now
            </Link>
          </div>

          {/* Recommended products for empty bag */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Curated For You</span>
                <h2 className="text-2xl font-black uppercase tracking-tight text-black mt-1">Trending Gear</h2>
              </div>
              <Link to="/shop" className="text-xs font-bold underline hover:text-slate-600">
                Explore All Products &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product) => (
                <div key={product.id} className="group relative bg-[#ffedd5]/40 border border-[#fdba74]/50 rounded-xl p-3 transition-shadow hover:shadow-md flex flex-col justify-between">
                  <div>
                    <div className="bg-[#fed7aa]/50 aspect-square mb-3 relative overflow-hidden rounded-lg">
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
                        className={`absolute top-2.5 right-2.5 p-2 rounded-full bg-white/95 shadow-sm hover:scale-110 active:scale-95 transition-all z-10 ${
                          wishlist.includes(product.id) ? 'ring-2 ring-red-100' : ''
                        }`}
                        title={wishlist.includes(product.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill={wishlist.includes(product.id) ? "#ef4444" : "none"} 
                          stroke={wishlist.includes(product.id) ? "#ef4444" : "#475569"} 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                        </svg>
                      </button>
                    </div>
                    
                    <h3 className="font-bold text-sm text-black group-hover:underline">
                      <Link to={`/product/${product.id}`}>{product.name}</Link>
                    </h3>
                    <p className="text-slate-500 text-xs font-medium mt-0.5">{product.category}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#fdba74]/30 flex items-center justify-between">
                    <p className="font-bold text-sm text-black">${product.price}</p>
                    <Link
                      to={`/product/${product.id}`}
                      className="text-xs font-bold bg-black text-white px-3.5 py-1.5 rounded-full hover:bg-slate-800 transition-colors"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-8">
            <ul className="divide-y divide-[#fdba74]/40 border-t border-b border-[#fdba74]/40">
              {cart.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                
                return (
                  <li key={item.id || `${item.productId}-${item.size}-${item.color}-${index}`} className="flex py-6 sm:py-8">
                    <div className="flex-shrink-0 bg-[#ffedd5] p-2 rounded-xl border border-[#fdba74]/40">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-center object-cover"
                      />
                    </div>

                    <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-base font-bold text-gray-900 hover:underline">
                              <Link to={`/product/${product.id}`}>{product.name}</Link>
                            </h3>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-slate-500">{product.category}</p>
                          <div className="mt-2 flex text-xs font-medium text-slate-700 gap-3">
                            <span className="bg-[#ffedd5] px-2.5 py-1 rounded-md border border-[#fdba74]/40">
                              Size: <strong>{item.size}</strong>
                            </span>
                            <span className="bg-[#ffedd5] px-2.5 py-1 rounded-md border border-[#fdba74]/40">
                              Color: <strong>{item.color}</strong>
                            </span>
                          </div>
                          <p className="mt-3 text-base font-black text-gray-900">${product.price}</p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9 flex items-center gap-4 sm:justify-end">
                          <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-sm font-bold text-gray-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-bold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                            title="Remove item"
                          >
                            <span className="sr-only">Remove</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex justify-between items-center">
              <Link to="/shop" className="text-xs font-bold text-black underline hover:text-slate-600">
                &larr; Continue Shopping
              </Link>
            </div>
          </div>

          <div className="mt-10 lg:mt-0 lg:col-span-4 bg-[#ffedd5] border border-[#fdba74]/60 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 border-b border-[#fdba74]/50 pb-3">
              Order Summary
            </h2>
            
            <dl className="mt-6 space-y-4 text-sm font-medium">
              <div className="flex items-center justify-between text-slate-700">
                <dt>Subtotal</dt>
                <dd className="font-bold text-slate-900">${getCartTotal().toFixed(2)}</dd>
              </div>
              <div className="border-t border-[#fdba74]/40 pt-4 flex items-center justify-between text-slate-700">
                <dt>Estimated Shipping</dt>
                <dd className="font-bold text-emerald-700">FREE</dd>
              </div>
              <div className="border-t border-[#fdba74]/40 pt-4 flex items-center justify-between text-base font-black text-slate-900">
                <dt>Order Total</dt>
                <dd>${getCartTotal().toFixed(2)}</dd>
              </div>
            </dl>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full bg-black text-white font-extrabold uppercase tracking-wider rounded-full py-4 px-4 text-sm hover:bg-slate-800 transition-colors shadow-md"
              >
                Proceed To Checkout
              </button>

              <p className="text-center text-[11px] font-semibold text-slate-500">
                Free 30-day returns & exchanges on all Raikart orders.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
