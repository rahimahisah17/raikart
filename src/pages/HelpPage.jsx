import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, RefreshCw, CreditCard, Ruler, UserCheck, HelpCircle, MessageSquare, Phone, ChevronDown, ChevronUp } from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'shipping', name: 'Shipping & Delivery', icon: Package },
    { id: 'returns', name: 'Returns & Exchanges', icon: RefreshCw },
    { id: 'orders', name: 'Orders & Payment', icon: CreditCard },
    { id: 'sizing', name: 'Size & Fit Guide', icon: Ruler },
    { id: 'account', name: 'Account & Join Us', icon: UserCheck },
  ];

  const faqs = [
    {
      id: 1,
      category: 'shipping',
      question: 'What are the delivery options and estimated shipping times?',
      answer: 'Standard Delivery takes 2-4 business days and is FREE for registered Raikart members on orders over $50. Express Delivery (1-2 business days) is available for $15 at checkout.'
    },
    {
      id: 2,
      category: 'shipping',
      question: 'How do I track my Raikart order?',
      answer: 'Once your order dispatches, you will receive an email containing a tracking link and shipment confirmation. You can also view live status updates anytime in your Profile page under Order History.'
    },
    {
      id: 3,
      category: 'returns',
      question: 'What is Raikart’s return policy?',
      answer: 'We offer hassle-free 30-day returns on all unworn, unwashed items with original tags intact. Returns are completely free for Raikart members.'
    },
    {
      id: 4,
      category: 'returns',
      question: 'How long does it take to process a refund?',
      answer: 'Refunds are issued to your original payment method within 3 to 5 business days after our distribution center receives and inspects your returned package.'
    },
    {
      id: 5,
      category: 'orders',
      question: 'What payment methods do you accept?',
      answer: 'We accept major credit/debit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, PayPal, and Raikart Gift Cards.'
    },
    {
      id: 6,
      category: 'orders',
      question: 'Can I modify or cancel my order after placing it?',
      answer: 'Orders enter processing quickly to ensure fast delivery. You can cancel within 15 minutes of placing your order directly from your Account Profile. After 15 minutes, please contact customer support.'
    },
    {
      id: 7,
      category: 'sizing',
      question: 'How do I find my right size in Raikart training gear?',
      answer: 'Our training tops and athletic bottoms run true to size. For compression gear, we recommend sizing up if you prefer a relaxed fit. View our detailed size chart on any product page.'
    },
    {
      id: 8,
      category: 'account',
      question: 'What are the benefits of joining Raikart Membership?',
      answer: 'As a Raikart Member ("Join Us"), you receive free shipping on all orders over $50, exclusive access to limited edition drops, early sales, and birthday discounts.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesQuery = searchQuery.trim() === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-widest bg-[#fef08a] px-3 py-1 rounded-full text-black">
          Raikart Support Center
        </span>
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mt-4 mb-4">
          GET HELP & SUPPORT
        </h1>
        <p className="text-slate-600 font-medium text-lg mb-8">
          Have questions about your order, shipping, or products? Search our help topics or reach out to our support team.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help articles (e.g. shipping, returns, sizes)..."
            className="w-full pl-12 pr-4 py-4 rounded-full bg-[#ffedd5] border border-[#fdba74]/60 text-black placeholder:text-slate-500 font-medium text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-black bg-[#fed7aa] px-2.5 py-1 rounded-full"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        <Link 
          to="/profile" 
          className="bg-[#ffedd5]/50 border border-[#fdba74]/50 hover:border-black p-6 rounded-2xl transition-all group flex flex-col items-start"
        >
          <div className="bg-[#fed7aa] p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6 text-black" />
          </div>
          <h3 className="font-bold text-lg text-black mb-1">Track Order</h3>
          <p className="text-xs text-slate-600 font-medium">Check the live status of your shipment and delivery timeline.</p>
        </Link>

        <Link 
          to="/contact" 
          className="bg-[#ffedd5]/50 border border-[#fdba74]/50 hover:border-black p-6 rounded-2xl transition-all group flex flex-col items-start"
        >
          <div className="bg-[#fed7aa] p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform">
            <RefreshCw className="w-6 h-6 text-black" />
          </div>
          <h3 className="font-bold text-lg text-black mb-1">Returns & Refunds</h3>
          <p className="text-xs text-slate-600 font-medium">Initiate a return or check your 30-day refund status.</p>
        </Link>

        <Link 
          to="/register" 
          className="bg-[#ffedd5]/50 border border-[#fdba74]/50 hover:border-black p-6 rounded-2xl transition-all group flex flex-col items-start"
        >
          <div className="bg-[#fed7aa] p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform">
            <UserCheck className="w-6 h-6 text-black" />
          </div>
          <h3 className="font-bold text-lg text-black mb-1">Join Us</h3>
          <p className="text-xs text-slate-600 font-medium">Sign up for free shipping, rewards, and exclusive product drops.</p>
        </Link>

        <Link 
          to="/contact" 
          className="bg-[#ffedd5]/50 border border-[#fdba74]/50 hover:border-black p-6 rounded-2xl transition-all group flex flex-col items-start"
        >
          <div className="bg-[#fed7aa] p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6 text-black" />
          </div>
          <h3 className="font-bold text-lg text-black mb-1">Contact Support</h3>
          <p className="text-xs text-slate-600 font-medium">Get in touch with our 24/7 Raikart customer support specialists.</p>
        </Link>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-black text-white shadow-md' 
                  : 'bg-[#ffedd5] text-black border border-[#fdba74] hover:bg-[#fed7aa]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion Section */}
      <div className="max-w-4xl mx-auto bg-white border border-[#fdba74]/60 rounded-3xl p-6 sm:p-10 shadow-sm mb-16">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-black flex items-center justify-between border-b pb-4 border-slate-100">
          <span>Frequently Asked Questions</span>
          <span className="text-xs font-bold text-slate-700 bg-[#ffedd5] px-3 py-1 rounded-full border border-[#fdba74]/40">
            {filteredFaqs.length} Articles
          </span>
        </h2>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-bold text-base">No help articles matched your search.</p>
            <p className="text-slate-400 text-xs mt-1">Try searching for generic terms like "shipping" or "return".</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="mt-4 bg-black text-white text-xs font-bold px-4 py-2 rounded-full"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className="py-4">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex justify-between items-center text-left py-2 focus:outline-none group"
                  >
                    <span className="font-bold text-base text-black group-hover:text-slate-700 pr-4">
                      {faq.question}
                    </span>
                    <span className="p-1 rounded-full bg-[#ffedd5] shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-black" /> : <ChevronDown className="w-4 h-4 text-black" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-2 text-slate-600 text-sm leading-relaxed pl-1 pt-1 font-medium bg-[#ffedd5]/40 p-4 rounded-xl border border-[#fdba74]/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Contact Banner */}
      <div className="bg-gradient-to-r from-black via-slate-900 to-black text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#fed7aa] bg-white/10 px-3 py-1 rounded-full">
            Still Need Assistance?
          </span>
          <h2 className="text-3xl font-black uppercase tracking-tight mt-3">We’re Here To Help 24/7</h2>
          <p className="text-slate-300 text-sm font-medium mt-2 max-w-xl">
            Our Raikart Support Team is available around the clock to answer product queries, track shipments, and guide your shopping experience.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 bg-[#fed7aa] text-black font-extrabold px-6 py-4 rounded-full hover:bg-white transition-colors text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Us Page</span>
          </Link>
          <a
            href="tel:18005557245"
            className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-bold px-6 py-4 rounded-full hover:bg-white/10 transition-colors text-sm"
          >
            <Phone className="w-4 h-4" />
            <span>1-800-RAIKART</span>
          </a>
        </div>
      </div>
    </div>
  );
}
