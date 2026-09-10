import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

import essTee from '../assets/images/essentials_white_tee_1788861487775.jpg';
import essHoodie from '../assets/images/essentials_black_hoodie_1788861505213.jpg';
import essShorts from '../assets/images/essentials_navy_shorts_1788861518120.jpg';
import essSocks from '../assets/images/essentials_white_socks_1788861530119.jpg';

import runShoes from '../assets/images/running_shoes_lime_1788861545427.jpg';
import runShorts from '../assets/images/running_shorts_black_1788861557947.jpg';
import runSinglet from '../assets/images/running_singlet_blue_1788861573303.jpg';
import runVest from '../assets/images/running_hydration_vest_1788861590080.jpg';

export default function HomePage() {
  const { products, toggleWishlist, wishlist } = useAppContext();
  const trendingProducts = products.slice(0, 4);

  const heroCollageImages = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
  ];

  const essentialsImages = [
    { id: 1, src: essTee, title: 'Cotton Crew Tee' },
    { id: 2, src: essHoodie, title: 'Fleece Hoodie' },
    { id: 3, src: essShorts, title: 'Lounge Shorts' },
    { id: 4, src: essSocks, title: 'Crew Socks' }
  ];

  const runningImages = [
    { id: 1, src: runShoes, title: 'Lime Mesh Runner' },
    { id: 2, src: runShorts, title: 'Split Running Shorts' },
    { id: 3, src: runSinglet, title: 'Royal Singlet' },
    { id: 4, src: runVest, title: 'Hydration Vest' }
  ];

  return (
    <div className="pb-20">
      {/* Main Hero - Light Orange Theme with Clothing Collage */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="w-full bg-[#fed7aa] border border-[#fdba74] rounded-3xl min-h-[600px] md:min-h-[700px] relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12 shadow-md">
          {/* Background Clothing Collage Grid - Two Rows (Up and Down) */}
          <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 grid-rows-2 gap-1.5 opacity-55 scale-105 pointer-events-none p-1">
            {heroCollageImages.map((imgSrc, idx) => (
              <div key={idx} className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-sm">
                <img 
                  src={imgSrc} 
                  alt="Clothing fashion model" 
                  className="w-full h-full object-cover filter brightness-105 contrast-100 saturate-100 hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>

          {/* Light Warm Orange Tint Overlay */}
          <div className="absolute inset-0 bg-[#fed7aa]/45 pointer-events-none" />

          {/* Hero Content */}
          <div className="text-center z-10 px-4 max-w-3xl mx-auto my-auto py-12">
            <span className="inline-block bg-black text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 shadow-sm">
              Just Arrived • New Collection
            </span>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase text-black mb-6 leading-none">
              Built For<br />The Future
            </h1>
            <p className="text-base sm:text-xl font-semibold text-slate-900 mb-8 max-w-lg mx-auto leading-relaxed">
              Experience the next generation of performance and style. Designed to push boundaries.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/shop" className="rounded-full bg-black text-white px-8 py-4 font-black uppercase tracking-wider text-sm hover:bg-slate-800 transition-colors shadow-md">
                Shop Collection
              </Link>
              <Link to="/shop" className="rounded-full bg-white text-black border border-black/20 px-8 py-4 font-black uppercase tracking-wider text-sm hover:bg-black hover:text-white transition-all shadow-md">
                Explore
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-medium">Trending Now</h2>
          <div className="flex gap-2">
            <Link to="/shop" className="text-sm font-semibold underline hover:text-slate-600">Shop All</Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <div key={product.id} className="group relative cursor-pointer bg-[#ffedd5]/40 border border-[#fdba74]/50 rounded-xl p-3">
              <div className="bg-[#fed7aa]/50 aspect-square mb-4 relative overflow-hidden rounded-md">
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
              <div className="flex justify-between items-start pr-1">
                <div>
                  <h3 className="font-bold text-sm text-black group-hover:underline">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">{product.category}</p>
                </div>
                <p className="font-bold text-sm text-black">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Visual */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-2xl font-medium mb-6">Featured</h2>
        <div className="w-full bg-slate-900 text-white aspect-[4/3] md:aspect-[21/9] flex flex-col items-start justify-end p-8 md:p-16 relative overflow-hidden">
           <div className="absolute inset-0 flex items-center justify-center opacity-15 overflow-hidden pointer-events-none">
            <span className="text-[30vw] text-[#fed7aa] tracking-tighter select-none whitespace-nowrap" style={{ fontFamily: "'Dancing Script', cursive", lineHeight: 1 }}>Raikart</span>
          </div>
          <div className="z-10 max-w-xl">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">
              Elite Performance
            </h2>
            <p className="text-base font-medium mb-6">
              Engineered to the exact specifications of championship athletes.
            </p>
            <Link to="/shop" className="inline-block rounded-full bg-white text-black px-6 py-2.5 font-medium hover:bg-slate-200 transition-colors">
              Shop Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Two Column Categories & Photo Grids */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 space-y-16">
         {/* Raikart Essentials: Everyday Comfort */}
         <div>
            <div className="flex justify-between items-end mb-6">
               <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Raikart Essentials</p>
                  <h2 className="text-3xl font-black uppercase tracking-tight">Everyday Comfort</h2>
               </div>
               <Link to="/shop" className="rounded-full bg-black text-white px-6 py-2 text-sm font-medium hover:bg-slate-800 transition-colors">
                  Shop Essentials
               </Link>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {essentialsImages.map((item) => (
                  <div key={item.id} className="group relative bg-[#fef9c3]/50 rounded-lg overflow-hidden border border-[#fef08a]">
                     <div className="aspect-square overflow-hidden bg-[#fef9c3]/30">
                        <img 
                           src={item.src} 
                           alt={item.title} 
                           className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                     </div>
                     <div className="p-3 bg-[#fffef5] border-t border-[#fef08a]/60">
                        <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Raikart Running: Push Your Limits */}
         <div>
            <div className="flex justify-between items-end mb-6">
               <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Raikart Running</p>
                  <h2 className="text-3xl font-black uppercase tracking-tight">Push Your Limits</h2>
               </div>
               <Link to="/shop" className="rounded-full bg-black text-white px-6 py-2 text-sm font-medium hover:bg-slate-800 transition-colors">
                  Shop Running
               </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {runningImages.map((item) => (
                  <div key={item.id} className="group relative bg-[#fef9c3]/50 rounded-lg overflow-hidden border border-[#fef08a]">
                     <div className="aspect-square overflow-hidden bg-[#fef9c3]/30">
                        <img 
                           src={item.src} 
                           alt={item.title} 
                           className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                     </div>
                     <div className="p-3 bg-[#fffef5] border-t border-[#fef08a]/60">
                        <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}
