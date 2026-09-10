import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, HelpCircle, Package, UserCheck } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order Status',
    orderNumber: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Order Status',
        orderNumber: '',
        message: ''
      });
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-widest bg-[#fed7aa] px-3 py-1 rounded-full text-black">
          We're Here For You
        </span>
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mt-4 mb-4">
          CONTACT US
        </h1>
        <p className="text-slate-600 font-medium text-lg">
          Have a question about an order, shipping, or gear? Send us a message below or connect with our support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Form Column */}
        <div className="lg:col-span-7 bg-white border border-[#fdba74]/60 rounded-3xl p-6 sm:p-10 shadow-sm">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-black">
            Send Us A Message
          </h2>
          <p className="text-xs font-medium text-slate-500 mb-8">
            Fill out the form below and a Raikart Customer Care representative will respond within 24 hours.
          </p>

          {submitted ? (
            <div className="bg-[#ffedd5] border border-[#fdba74] p-8 rounded-2xl text-center my-6">
              <CheckCircle2 className="w-16 h-16 text-black mx-auto mb-4" />
              <h3 className="text-2xl font-black uppercase tracking-tight text-black mb-2">
                Message Sent Successfully!
              </h3>
              <p className="text-sm font-medium text-slate-700 max-w-md mx-auto mb-6">
                Thank you for contacting Raikart. We have received your inquiry and sent a confirmation to your email address.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-black text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full hover:bg-slate-800 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-3 rounded-xl bg-[#ffedd5]/50 border border-[#fdba74]/50 text-black placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#ffedd5]/50 border border-[#fdba74]/50 text-black placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 000-0000"
                    className="w-full px-4 py-3 rounded-xl bg-[#ffedd5]/50 border border-[#fdba74]/50 text-black placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Topic / Inquiry <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#ffedd5]/50 border border-[#fdba74]/50 text-black font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="Order Status">Order Status & Tracking</option>
                    <option value="Return / Exchange">Return or Exchange</option>
                    <option value="Product Sizing">Product Sizing & Fit</option>
                    <option value="Account & Membership">Account & Join Us Membership</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="orderNumber" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Order Number (If applicable)
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  placeholder="e.g. RK-98421"
                  className="w-full px-4 py-3 rounded-xl bg-[#ffedd5]/50 border border-[#fdba74]/50 text-black placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  How can we help? <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your question or issue in detail..."
                  className="w-full px-4 py-3 rounded-xl bg-[#ffedd5]/50 border border-[#fdba74]/50 text-black placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-white font-extrabold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Info & Support Channels Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#ffedd5] border border-[#fdba74]/60 rounded-3xl p-6 sm:p-8">
            <h3 className="text-xl font-black uppercase tracking-tight text-black mb-6 border-b border-[#fdba74]/50 pb-3">
              Direct Contact Channels
            </h3>

            <div className="space-y-6 text-sm font-medium">
              <div className="flex items-start gap-4">
                <div className="bg-black text-white p-3 rounded-xl shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-black uppercase tracking-wider text-xs">Phone Support</h4>
                  <p className="text-base font-extrabold text-black mt-0.5">1-800-RAIKART</p>
                  <p className="text-xs text-slate-600 mt-1">Toll-free 24 hours a day, 7 days a week.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-black text-white p-3 rounded-xl shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-black uppercase tracking-wider text-xs">Customer Service Email</h4>
                  <p className="text-base font-extrabold text-black mt-0.5">support@raikart.com</p>
                  <p className="text-xs text-slate-600 mt-1">Guaranteed email response within 24 hours.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-black text-white p-3 rounded-xl shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-black uppercase tracking-wider text-xs">Live Support Hours</h4>
                  <p className="text-sm font-bold text-black mt-0.5">24/7 Mon – Sun</p>
                  <p className="text-xs text-slate-600 mt-1">Our support agents are always online to assist.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-black text-white p-3 rounded-xl shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-black uppercase tracking-wider text-xs">Global Headquarters</h4>
                  <p className="text-xs font-bold text-black mt-0.5">Raikart Athletics HQ</p>
                  <p className="text-xs text-slate-600">100 Raikart Way, Beaverton, OR 97005</p>
                </div>
              </div>
            </div>
          </div>

          {/* Helpful Navigation Cards */}
          <div className="bg-white border border-[#fdba74]/60 rounded-3xl p-6 sm:p-8 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Quick Self-Service</h4>

            <Link
              to="/help"
              className="flex items-center justify-between p-3 rounded-xl bg-[#ffedd5]/50 hover:bg-[#ffedd5] transition-colors border border-[#fdba74]/50 font-bold text-xs text-black"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-black" />
                <span>Browse Help Center FAQs</span>
              </div>
              <span>&rarr;</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center justify-between p-3 rounded-xl bg-[#ffedd5]/50 hover:bg-[#ffedd5] transition-colors border border-[#fdba74]/50 font-bold text-xs text-black"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-black" />
                <span>Track An Existing Order</span>
              </div>
              <span>&rarr;</span>
            </Link>

            <Link
              to="/register"
              className="flex items-center justify-between p-3 rounded-xl bg-[#ffedd5]/50 hover:bg-[#ffedd5] transition-colors border border-[#fdba74]/50 font-bold text-xs text-black"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-black" />
                <span>Join Us (Raikart Member Perks)</span>
              </div>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
