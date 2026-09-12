import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CreditCard, ShieldCheck, Building, Smartphone, CheckCircle, Lock, ArrowLeft } from 'lucide-react';

export default function PaymentPage() {
  const { cart, getCartTotal, products } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve pending checkout details from location state or localStorage fallback
  const pendingDetails = location.state || JSON.parse(localStorage.getItem('raikart_pending_checkout') || '{}');

  const [paymentMethod, setPaymentMethod] = useState('paystack_card'); // 'paystack_card', 'paystack_bank', 'paystack_ussd'
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Load Paystack Inline JS script dynamically
  useEffect(() => {
    if (pendingDetails && pendingDetails.email) {
      localStorage.setItem('raikart_pending_checkout', JSON.stringify(pendingDetails));
    }
  }, [pendingDetails]);

  const totalAmount = getCartTotal();

  // Prices are NOT converted to Naira. The dollar figure is passed through
  // 1:1 (no exchange-rate multiplication) — Paystack bills in kobo, so a
  // $45 item is charged as 4500 kobo.
  const usdToKobo = (usd) => Math.round((Number(usd) || 0) * 100);

  if (cart.length === 0 && !paymentSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-black mb-4 uppercase tracking-tight">No Active Checkout Session</h1>
        <p className="text-slate-600 mb-6">Your bag is currently empty.</p>
        <Link to="/shop" className="bg-black text-white px-8 py-3 rounded-full font-bold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handlePaystackPayment = async (e) => {
    if (e) e.preventDefault();
    setProcessing(true);

    const email = pendingDetails.email || 'customer@example.com';
    const name = pendingDetails.name || `${pendingDetails.firstName || 'Customer'} ${pendingDetails.lastName || ''}`.trim();
    const address = pendingDetails.address || 'Plot 30, Lagos, Nigeria';
    const amountInKobo = usdToKobo(totalAmount);

    const reference = `pst_tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const callbackUrl = `${window.location.origin}/payment/callback`;

    // Persist the reference + amount so the callback page can verify and
    // finalize the order after Paystack redirects back.
    localStorage.setItem(
      'raikart_pending_payment',
      JSON.stringify({ reference, amountInKobo })
    );

    try {
      // Start the transaction server-side (uses the SECRET key) and redirect
      // the browser to Paystack's hosted checkout page. This avoids the inline
      // iframe entirely, which is far more reliable across browsers.
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          amount: amountInKobo,
          reference,
          callbackUrl,
          metadata: {
            custom_fields: [
              { display_name: 'Customer Name', variable_name: 'customer_name', value: name },
              { display_name: 'Shipping Address', variable_name: 'shipping_address', value: address }
            ]
          }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.authorizationUrl) {
        throw new Error(data.error || 'Could not start payment');
      }

      window.location.href = data.authorizationUrl;
    } catch (err) {
      setProcessing(false);
      localStorage.removeItem('raikart_pending_payment');
      alert(err.message || 'Could not start payment');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#fdba74]/40">
        <button
          onClick={() => navigate('/checkout')}
          className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shipping</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>Paystack Secured 256-bit Encryption</span>
        </div>
      </div>

      {/* Success View */}
      {paymentSuccess ? (
        <div className="bg-[#ffedd5]/40 border border-[#fdba74] rounded-3xl p-8 sm:p-12 text-center shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full">
              Payment Successful
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mt-4 text-black">
              Thank You For Your Order!
            </h1>
            <p className="text-slate-600 mt-2 font-medium">
              Paystack Reference: <span className="font-mono font-bold text-black">{paymentSuccess.reference}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#fdba74]/60 text-left max-w-lg mx-auto text-sm space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-medium">Order ID</span>
              <span className="font-bold text-black">{paymentSuccess.orderId}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-medium">Customer</span>
              <span className="font-bold text-black">{paymentSuccess.name} ({paymentSuccess.email})</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-medium">Shipping Address</span>
              <span className="font-bold text-black text-right max-w-[200px]">{paymentSuccess.address}</span>
            </div>
            <div className="flex justify-between pt-1 text-base">
              <span className="font-extrabold text-black">Total Paid</span>
              <span className="font-black text-emerald-600">${paymentSuccess.amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              to="/profile"
              className="bg-black text-white px-8 py-3.5 rounded-full font-extrabold uppercase text-xs tracking-wider hover:bg-slate-800 transition-colors"
            >
              View Order History
            </Link>
            <Link
              to="/shop"
              className="bg-[#ffedd5] text-black border border-[#fdba74] px-8 py-3.5 rounded-full font-extrabold uppercase text-xs tracking-wider hover:bg-[#fed7aa] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        /* Payment Gateway Selector & Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Paystack Payment</h1>
              <p className="text-slate-600 text-sm font-medium mt-1">
                Select your preferred Paystack payment option to complete your purchase.
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                Choose Payment Method
              </label>

              {/* Card Option */}
              <div
                onClick={() => setPaymentMethod('paystack_card')}
                className={`border rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'paystack_card'
                    ? 'border-black bg-black text-white shadow-md'
                    : 'border-[#fdba74]/60 bg-[#ffedd5]/40 text-black hover:bg-[#fed7aa]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <div>
                    <h3 className="font-extrabold text-sm">Paystack Debit / Credit Card</h3>
                    <p className={`text-xs ${paymentMethod === 'paystack_card' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Mastercard, Visa, Verve
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'paystack_card' ? 'border-white bg-white' : 'border-slate-400'
                }`}>
                  {paymentMethod === 'paystack_card' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                </div>
              </div>

              {/* Bank Transfer Option */}
              <div
                onClick={() => setPaymentMethod('paystack_bank')}
                className={`border rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'paystack_bank'
                    ? 'border-black bg-black text-white shadow-md'
                    : 'border-[#fdba74]/60 bg-[#ffedd5]/40 text-black hover:bg-[#fed7aa]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5" />
                  <div>
                    <h3 className="font-extrabold text-sm">Paystack Bank Transfer</h3>
                    <p className={`text-xs ${paymentMethod === 'paystack_bank' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Instant transfer from any Nigerian bank
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'paystack_bank' ? 'border-white bg-white' : 'border-slate-400'
                }`}>
                  {paymentMethod === 'paystack_bank' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                </div>
              </div>

              {/* USSD Option */}
              <div
                onClick={() => setPaymentMethod('paystack_ussd')}
                className={`border rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'paystack_ussd'
                    ? 'border-black bg-black text-white shadow-md'
                    : 'border-[#fdba74]/60 bg-[#ffedd5]/40 text-black hover:bg-[#fed7aa]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5" />
                  <div>
                    <h3 className="font-extrabold text-sm">Paystack USSD Code</h3>
                    <p className={`text-xs ${paymentMethod === 'paystack_ussd' ? 'text-slate-300' : 'text-slate-500'}`}>
                      GTBank, Access, Zenith, FirstBank USSD
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'paystack_ussd' ? 'border-white bg-white' : 'border-slate-400'
                }`}>
                  {paymentMethod === 'paystack_ussd' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePaystackPayment}
              disabled={processing}
              className="w-full bg-black text-white border border-transparent rounded-full py-4 px-6 text-base font-black uppercase tracking-wider hover:bg-slate-800 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Paystack Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <span>Complete Paystack Payment (${totalAmount.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5 bg-[#ffedd5]/40 border border-[#fdba74]/60 rounded-3xl p-6 space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight border-b border-[#fdba74]/50 pb-3">
              Order Summary
            </h2>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                return (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover bg-white border" />
                    <div className="flex-1 text-xs">
                      <h3 className="font-extrabold text-black">{product.name}</h3>
                      <p className="text-slate-500 mt-0.5">Qty {item.quantity} | {item.size} | {item.color}</p>
                      <p className="font-bold text-black mt-1">${(product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#fdba74]/60 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Shipping</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-black text-black pt-2 border-t border-[#fdba74]/40">
                <span>Total Due</span>
                <span className="text-emerald-700">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-white/80 p-4 rounded-2xl border border-[#fdba74]/50 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-black">Customer Information:</p>
              <p>{pendingDetails.name || 'Rahimah Sulayman'}</p>
              <p>{pendingDetails.email || 'rahimahisah17@gmail.com'}</p>
              <p>{pendingDetails.address || 'Plot 30'}, {pendingDetails.city || 'Lagos'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
