import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function ProfilePage() {
  const { user, isAdmin, loading, logout, updateProfile, orders, products } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  if (loading) {
    return <div className="text-center py-20">Loading profile...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleUpdate = (e) => {
    e.preventDefault();
    updateProfile(formData.name, formData.email);
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter">My Account</h1>
        <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-black">Sign Out</button>
      </div>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        {/* Profile Info */}
        <div className="lg:col-span-4 mb-10 lg:mb-0">
          <h2 className="text-xl font-medium mb-6">Profile Details</h2>
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" disabled />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium">Save</button>
                <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-lg">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-lg">{user.email}</p>
              </div>
              <button onClick={() => setIsEditing(true)} className="mt-4 border border-black text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-50">
                Edit Profile
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="mt-8 bg-black text-white p-5 rounded-2xl border border-amber-400/40 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Admin Status: Active</span>
              </div>
              <h3 className="font-black text-lg text-white">Administrator Access Granted</h3>
              <p className="text-xs text-slate-300">
                You have super administrator permissions to manage products, categories, inventory, orders, and users.
              </p>
              <Link
                to="/admin"
                className="inline-block bg-amber-400 text-black text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-full hover:bg-amber-300 transition-colors shadow-md mt-2"
              >
                Open Admin Portal &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Orders History */}
        <div className="lg:col-span-8">
          <h2 className="text-xl font-medium mb-6">Order History</h2>
          
          {orders.length === 0 ? (
            <p className="text-gray-500">You haven't placed any orders yet.</p>
          ) : (
            <div className="space-y-8">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 sm:flex sm:justify-between sm:items-center">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Order Number</p>
                        <p className="text-sm font-medium text-gray-900">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                        <p className="text-sm font-medium text-gray-900">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                        <p className="text-sm font-medium text-gray-900">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <ul className="divide-y divide-gray-200">
                      {order.items.map((item, index) => {
                        const product = products.find(p => p.id === item.productId);
                        if (!product) return null;
                        return (
                          <li key={item.id || `${item.productId}-${item.size}-${item.color}-${index}`} className="py-4 flex">
                            <img src={product.image} alt={product.name} className="w-16 h-16 rounded-md object-cover" />
                            <div className="ml-4 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  <Link to={`/product/${product.id}`}>{product.name}</Link>
                                </h4>
                                <p className="text-sm text-gray-500">Qty: {item.quantity} | Size: {item.size} | Color: {item.color}</p>
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              ${(product.price * item.quantity).toFixed(2)}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
