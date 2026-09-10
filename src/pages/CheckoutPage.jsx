import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function CheckoutPage() {
  const { cart, getCartTotal, checkout, products } = useAppContext();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    country: '',
    zip: '',
    cardNumber: '',
    expDate: '',
    cvc: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const pendingData = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      address: formData.address,
      city: formData.city,
      country: formData.country,
      zip: formData.zip,
      cardNumber: formData.cardNumber,
      expDate: formData.expDate
    };
    localStorage.setItem('raikart_pending_checkout', JSON.stringify(pendingData));
    navigate('/payment', { state: pendingData });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-black mb-4">Your bag is empty.</h1>
        <Link to="/shop" className="text-blue-600 underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black tracking-tighter uppercase mb-10">Checkout</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input required type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border" />
            </div>

            <h2 className="text-lg font-medium text-gray-900 mb-4 mt-10">Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First name</label>
                <input required type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last name</label>
                <input required type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border" />
              </div>
              <div className="col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input required type="text" id="address" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border" />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input required type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border" />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                <input required type="text" id="country" name="country" value={formData.country} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border" />
              </div>
              <div className="col-span-2">
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Postal code</label>
                <input required type="text" id="zip" name="zip" value={formData.zip} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border" />
              </div>
            </div>

            <h2 className="text-lg font-medium text-gray-900 mb-4 mt-10">Payment Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="col-span-2">
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card number</label>
                <input required type="text" id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="0000 0000 0000 0000" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border" />
              </div>
              <div>
                <label htmlFor="expDate" className="block text-sm font-medium text-gray-700">Expiration date (MM/YY)</label>
                <input required type="text" id="expDate" name="expDate" value={formData.expDate} onChange={handleChange} placeholder="MM/YY" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border" />
              </div>
              <div>
                <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
                <input required type="text" id="cvc" name="cvc" value={formData.cvc} onChange={handleChange} placeholder="123" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black p-2 border" />
              </div>
            </div>

            <button type="submit" className="w-full bg-black border border-transparent rounded-full shadow-sm py-4 px-4 text-base font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
              Pay ${getCartTotal().toFixed(2)}
            </button>
          </form>
        </div>

        <div className="mt-10 lg:mt-0 lg:col-span-5 bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
          <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {cart.map((item, index) => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;
              return (
                <li key={item.id || `${item.productId}-${item.size}-${item.color}-${index}`} className="py-4 flex">
                  <img src={product.image} alt={product.name} className="w-16 h-16 rounded-md object-cover" />
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">Qty {item.quantity} | {item.size} | {item.color}</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">${(product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="pt-4 flex justify-between font-medium text-gray-900">
            <span>Total</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
