import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, User, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';

export default function MainLayout() {
  const { cart, wishlist = [], user, isAdmin } = useAppContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/shop?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/shop');
    }
    setMobileSearchOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-black selection:bg-black selection:text-white bg-[#fff2e6]">
      {/* Top Utility Bar */}
      <div className="bg-[#fed7aa]/60 border-b border-[#fdba74]/40 text-xs font-medium py-2 px-4 sm:px-6 lg:px-8 hidden md:flex justify-between items-center z-50 relative">
        <div className="flex gap-4">
          <span className="cursor-pointer hover:text-slate-500">Raikart Premium</span>
          <span className="cursor-pointer hover:text-slate-500">Raikart Essentials</span>
        </div>
        <div className="flex gap-3 text-slate-500">
          <Link to="/register" className="hover:text-black font-semibold text-black transition-colors">Join Us</Link>
          <span>|</span>
          <Link to="/help" className="hover:text-black transition-colors">Help</Link>
          <span>|</span>
          <Link to="/contact" className="hover:text-black transition-colors">Contact</Link>
          <span>|</span>
          <Link to={user ? "/profile" : "/login"} className="hover:text-black transition-colors">
            {user ? `Hi, ${user.name}` : 'Sign In'}
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#fff2e6]/95 backdrop-blur-sm border-b border-[#fdba74]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="hover:opacity-80 transition-opacity" aria-label="Raikart Home">
                <span className="text-4xl text-black" style={{ fontFamily: "'Dancing Script', cursive" }}>Raikart</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8 absolute left-1/2 -translate-x-1/2">
              <Link to="/shop" className="text-base font-medium hover:border-b-2 border-black pb-1 pt-1">New & Featured</Link>
              <Link to="/shop?q=Men" className="text-base font-medium hover:border-b-2 border-black pb-1 pt-1">Men</Link>
              <Link to="/shop?q=Women" className="text-base font-medium hover:border-b-2 border-black pb-1 pt-1">Women</Link>
              <Link to="/shop?q=Women%27s%20Training%20Top" className="text-base font-medium hover:border-b-2 border-black pb-1 pt-1">Training Tops</Link>
            </nav>

            {/* Icons & Desktop Search Form */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <form onSubmit={handleSearch} className="hidden md:flex items-center bg-[#ffedd5] border border-[#fdba74]/60 rounded-full px-3 py-1.5 hover:bg-[#fed7aa] transition-colors">
                <button type="submit" aria-label="Search button" className="p-1 text-slate-700 hover:text-black transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..." 
                  className="bg-transparent border-none outline-none text-sm ml-1 w-32 focus:w-48 transition-all text-black placeholder:text-slate-500 font-medium" 
                />
              </form>

              {/* Mobile Search Toggle Button */}
              <button 
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)} 
                className="md:hidden text-black p-1 hover:opacity-70 transition-opacity"
                aria-label="Toggle mobile search"
              >
                <Search className="w-6 h-6" strokeWidth={1.5} />
              </button>



              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="text-black hover:opacity-65 transition-opacity p-1.5 bg-[#fed7aa] border border-[#fdba74] rounded-full flex items-center justify-center shadow-sm"
                  title="Admin Portal"
                >
                  <ShieldCheck className="w-5 h-5 text-amber-800" />
                </Link>
              )}

              <Link to={user ? "/profile" : "/login"} className="text-black hover:opacity-60 transition-opacity md:hidden">
                <User className="w-6 h-6" strokeWidth={1.5} />
              </Link>
              <Link to="/wishlist" className="text-black hover:opacity-60 transition-opacity hidden md:block relative p-1" title="Favorites">
                <Heart className={`w-6 h-6 transition-colors ${wishlist.length > 0 ? 'text-red-500 fill-red-500' : ''}`} strokeWidth={1.5} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="text-black hover:opacity-60 transition-opacity relative">
                <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              <button className="md:hidden text-black hover:opacity-60 transition-opacity">
                <Menu className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Dropdown */}
          {mobileSearchOpen && (
            <div className="md:hidden pb-3 pt-1 px-2 border-t border-[#fdba74]/60">
              <form onSubmit={handleSearch} className="flex items-center bg-[#ffedd5] border border-[#fdba74]/60 rounded-full px-4 py-2 w-full">
                <button type="submit" aria-label="Execute search" className="mr-2 text-slate-700">
                  <Search className="w-4 h-4" />
                </button>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..." 
                  className="bg-transparent border-none outline-none text-sm w-full text-black font-medium" 
                  autoFocus
                />
                <button type="submit" className="text-xs font-bold bg-black text-white px-3 py-1 rounded-full ml-2">
                  Go
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-black text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <Link to="/register" className="block text-sm font-bold uppercase tracking-widest hover:text-[#fed7aa] transition-colors">Join Us / Member Perks</Link>
              <Link to="/help" className="block text-sm font-bold uppercase tracking-widest hover:text-[#fed7aa] transition-colors">Help & FAQ</Link>
              <Link to="/contact" className="block text-sm font-bold uppercase tracking-widest hover:text-[#fed7aa] transition-colors">Contact Support</Link>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Get Help</h3>
              <ul className="space-y-3 text-xs font-medium text-slate-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Order Status</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Delivery</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Returns</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Payment Options</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4">About Raikart</h3>
              <ul className="space-y-3 text-xs font-medium text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">News</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investors</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
              </ul>
            </div>
            <div className="flex gap-4 md:justify-end">
              {/* Social placeholders */}
              <div className="w-8 h-8 rounded-full bg-slate-500 hover:bg-white cursor-pointer transition-colors"></div>
              <div className="w-8 h-8 rounded-full bg-slate-500 hover:bg-white cursor-pointer transition-colors"></div>
              <div className="w-8 h-8 rounded-full bg-slate-500 hover:bg-white cursor-pointer transition-colors"></div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-medium text-slate-500">
            <div className="mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Raikart, Inc. All Rights Reserved
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Guides</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Sale</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
