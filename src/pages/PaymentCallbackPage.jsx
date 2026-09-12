import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

/**
 * PaymentCallbackPage — Paystack redirects back here (callback_url) after the
 * hosted checkout page finishes. This page verifies the transaction server-side
 * (using the SECRET key), records the order, decrements stock, and shows the
 * result. It never trusts the client — verification is authoritative.
 */
export default function PaymentCallbackPage() {
  const { cart, checkout, getCartTotal, loading } = useAppContext();
  const [searchParams] = useSearchParams();
  const [phase, setPhase] = useState('verifying'); // 'verifying' | 'success' | 'failed'
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const startedRef = useRef(false);

  useEffect(() => {
    // Wait until the app context has restored the signed-in user + cart from
    // localStorage (Firebase auth is re-established after the full-page redirect).
    if (loading) return;
    if (startedRef.current) return;
    startedRef.current = true;

    const reference = searchParams.get('reference') || searchParams.get('trxref') || '';
    const pendingRaw = localStorage.getItem('raikart_pending_payment');
    let pending = {};
    try {
      pending = pendingRaw ? JSON.parse(pendingRaw) : {};
    } catch {
      pending = {};
    }
    const amountInKobo = pending.amountInKobo;
    const pendingDetails = JSON.parse(
      localStorage.getItem('raikart_pending_checkout') || '{}'
    );

    (async () => {
      if (!reference) {
        setError('No payment reference was returned by Paystack.');
        setPhase('failed');
        return;
      }

      try {
        const res = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference, amount: amountInKobo })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Payment verification failed');
        }

        const verification = data.verification || {};

        const shippingInfo = {
          email: pendingDetails.email || 'customer@example.com',
          name:
            pendingDetails.name ||
            `${pendingDetails.firstName || 'Customer'} ${pendingDetails.lastName || ''}`.trim(),
          address: `${pendingDetails.address || 'Plot 30'}, ${pendingDetails.city || 'Lagos'}, ${pendingDetails.country || 'Nigeria'} ${pendingDetails.zip || '102101'}`
        };

        const paymentInfo = {
          method: 'Paystack',
          reference,
          channel: verification.channel || '',
          status: 'paid',
          paidAt: verification.paidAt || new Date().toISOString()
        };

        const orderId = await checkout(shippingInfo, paymentInfo);

        localStorage.removeItem('raikart_pending_payment');
        localStorage.removeItem('raikart_pending_checkout');

        setResult({
          orderId,
          reference,
          amount: (amountInKobo || verification.amount || 0) / 100,
          email: shippingInfo.email,
          name: shippingInfo.name,
          address: shippingInfo.address
        });
        setPhase('success');
      } catch (err) {
        setError(err.message || 'Payment verification failed');
        setPhase('failed');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      {phase === 'verifying' && (
        <div className="bg-[#ffedd5]/40 border border-[#fdba74] rounded-3xl p-12 text-center space-y-6">
          <div className="w-16 h-16 mx-auto flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-[#fdba74] animate-spin" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Verifying your payment…
          </h1>
          <p className="text-slate-600 font-medium">
            Confirming your transaction with Paystack. Please don't close this page.
          </p>
        </div>
      )}

      {phase === 'success' && (
        <div className="bg-[#ffedd5]/40 border border-[#fdba74] rounded-3xl p-8 sm:p-12 text-center shadow-xl space-y-6">
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
              Paystack Reference:{' '}
              <span className="font-mono font-bold text-black">{result?.reference}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#fdba74]/60 text-left max-w-lg mx-auto text-sm space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-medium">Order ID</span>
              <span className="font-bold text-black">{result?.orderId}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-medium">Customer</span>
              <span className="font-bold text-black">
                {result?.name} ({result?.email})
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-medium">Shipping Address</span>
              <span className="font-bold text-black text-right max-w-[200px]">
                {result?.address}
              </span>
            </div>
            <div className="flex justify-between pt-1 text-base">
              <span className="font-extrabold text-black">Total Paid</span>
              <span className="font-black text-emerald-600">
                ${(result?.amount || 0).toFixed(2)}
              </span>
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
      )}

      {phase === 'failed' && (
        <div className="bg-[#ffedd5]/40 border border-[#fdba74] rounded-3xl p-8 sm:p-12 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
            <XCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-red-800 bg-red-100 px-4 py-1.5 rounded-full">
              Payment Not Completed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mt-4 text-black">
              We couldn't confirm your payment
            </h1>
            <p className="text-slate-600 mt-2 font-medium">{error}</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              onClick={() => window.location.assign('/payment')}
              className="bg-black text-white px-8 py-3.5 rounded-full font-extrabold uppercase text-xs tracking-wider hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Try Again
            </button>
            <Link
              to="/shop"
              className="bg-[#ffedd5] text-black border border-[#fdba74] px-8 py-3.5 rounded-full font-extrabold uppercase text-xs tracking-wider hover:bg-[#fed7aa] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
