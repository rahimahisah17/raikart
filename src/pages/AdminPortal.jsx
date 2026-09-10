import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Warehouse, ShoppingCart, Users, Check, X, ShieldCheck } from 'lucide-react';
import defaultProductImg from '../assets/images/raikart_air_max_1788860931144.jpg';
import { useAppContext } from '../context/AppContext';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { collection, collectionGroup, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import CloudinaryUploader from '../components/CloudinaryUploader';

export default function AdminPortal() {
  const { user, isAdmin, loading, products, categories } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  const [allOrders, setAllOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [admins, setAdmins] = useState([]);

  // Fetch admin-only global data
  useEffect(() => {
    if (isAdmin) {
      const unsubOrders = onSnapshot(collectionGroup(db, 'orders'), (snap) => {
        const o = snap.docs.map(d => ({ 
          id: d.id, 
          userId: d.ref.parent.parent.id, // Extract userId from path
          ...d.data() 
        }));
        o.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setAllOrders(o);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders (group)'));

      const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
        setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

      const unsubAdmins = onSnapshot(collection(db, 'admins'), (snap) => {
        setAdmins(snap.docs.map(d => d.id));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'admins'));

      return () => {
        unsubOrders();
        unsubUsers();
        unsubAdmins();
      };
    }
  }, [isAdmin]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Manage Products', icon: Package },
    { id: 'categories', label: 'Manage Categories', icon: Tags },
    { id: 'inventory', label: 'Manage Inventory', icon: Warehouse },
    { id: 'orders', label: 'Manage Orders', icon: ShoppingCart },
    { id: 'users', label: 'Manage Users', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-black text-amber-300 border border-amber-400/50 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Admin Portal</h1>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Logged in as: <span className="text-black underline">{user?.email}</span>
          </p>
        </div>
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6 overflow-hidden">
        {activeTab === 'dashboard' && <DashboardView orders={allOrders} users={allUsers} products={products} />}
        {activeTab === 'products' && <ProductsView products={products} categories={categories} />}
        {activeTab === 'categories' && <CategoriesView categories={categories} />}
        {activeTab === 'inventory' && <InventoryView products={products} />}
        {activeTab === 'orders' && <OrdersView orders={allOrders} />}
        {activeTab === 'users' && <UsersView users={allUsers} admins={admins} />}
      </div>
    </div>
  );
}

function DashboardView({ orders, users, products }) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const lowStock = products.filter(p => p.stock < 10);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Dashboard Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
          <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">Low Stock Items</p>
          <p className="text-2xl font-bold text-red-600">{lowStock.length}</p>
        </div>
      </div>
    </div>
  );
}

function ProductsView({ products, categories }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    category: '', 
    image: '', 
    description: '', 
    stock: '',
    colorsInput: 'Black, White, Orange',
    sizesInput: 'XS, S, M, L, XL'
  });

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({ 
      ...p, 
      price: p.price.toString(), 
      stock: p.stock.toString(),
      colorsInput: Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || 'Black, White'),
      sizesInput: Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || 'S, M, L')
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ 
      name: '', 
      price: '', 
      category: '', 
      image: '', 
      description: '', 
      stock: '',
      colorsInput: 'Black, White, Orange',
      sizesInput: 'XS, S, M, L, XL'
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const id = editingId === 'new' || !editingId ? `prod-${Date.now()}` : editingId;
    
    const parsedColors = form.colorsInput.split(',').map(c => c.trim()).filter(Boolean);
    const parsedSizes = form.sizesInput.split(',').map(s => s.trim()).filter(Boolean);

    const productData = {
      name: form.name,
      category: form.category || categories[0]?.name || 'Uncategorized',
      price: parseFloat(form.price) || 0,
      description: form.description || 'Premium Raikart clothing apparel.',
      image: form.image || defaultProductImg,
      colors: parsedColors.length > 0 ? parsedColors : ['Black', 'White'],
      sizes: parsedSizes.length > 0 ? parsedSizes : ['S', 'M', 'L'],
      stock: parseInt(form.stock) || 0,
      updatedAt: serverTimestamp()
    };

    if (!editingId) productData.createdAt = serverTimestamp();

    try {
      await setDoc(doc(db, 'products', id), productData, { merge: true });
      resetForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Manage Products</h2>
        {!editingId && <button onClick={() => setEditingId('new')} className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium">Add Product</button>}
      </div>

      {editingId ? (
        <form onSubmit={handleSave} className="space-y-4 bg-slate-50 p-6 rounded-lg border border-slate-200 mb-6">
          <h3 className="font-bold">{editingId === 'new' ? 'New Product' : 'Edit Product'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Clothing Item Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border p-2 rounded" />
            <input required type="number" step="0.01" placeholder="Price ($)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="border p-2 rounded" />
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="border p-2 rounded">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <input required type="number" placeholder="Inventory Stock Qty" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="border p-2 rounded" />
            <input placeholder="Colors (e.g. Black, White, Royal Blue)" value={form.colorsInput} onChange={e => setForm({...form, colorsInput: e.target.value})} className="border p-2 rounded" />
            <input placeholder="Sizes (e.g. XS, S, M, L, XL)" value={form.sizesInput} onChange={e => setForm({...form, sizesInput: e.target.value})} className="border p-2 rounded" />
            <div className="col-span-2">
              <CloudinaryUploader 
                label="Clothing Picture (Cloudinary)" 
                value={form.image} 
                onChange={(url) => setForm({...form, image: url})} 
              />
            </div>
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="border p-2 rounded col-span-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-black text-white px-4 py-2 rounded text-sm font-medium">Save</button>
            <button type="button" onClick={resetForm} className="bg-gray-200 text-black px-4 py-2 rounded text-sm font-medium">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-700">Image</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Name</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Price</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3"><img src={p.image} className="w-12 h-12 object-cover rounded" alt="" /></td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">${p.price.toFixed(2)}</td>
                  <td className="p-3">
                    <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CategoriesView({ categories }) {
  const [name, setName] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = `cat-${Date.now()}`;
    try {
      await setDoc(doc(db, 'categories', id), {
        name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setName('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${id}`);
    }
  };

  const handleDelete = async (id) => {
    if(confirm('Delete this category?')) {
      try { await deleteDoc(doc(db, 'categories', id)); }
      catch (err) { handleFirestoreError(err, OperationType.DELETE, `categories/${id}`); }
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Manage Categories</h2>
      <form onSubmit={handleAdd} className="flex gap-2 mb-8">
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="New Category Name" className="flex-1 border p-2 rounded" />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded font-medium">Add</button>
      </form>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c.id} className="flex justify-between items-center border rounded p-4 bg-slate-50">
            <span className="font-medium">{c.name}</span>
            <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryView({ products }) {
  const handleStockUpdate = async (id, newStock) => {
    try {
      await updateDoc(doc(db, 'products', id), { stock: parseInt(newStock) || 0, updatedAt: serverTimestamp() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Manage Inventory</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="p-3 text-sm font-semibold text-gray-700">Product Name</th>
              <th className="p-3 text-sm font-semibold text-gray-700">SKU/ID</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Current Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-xs text-gray-500">{p.id}</td>
                <td className="p-3">
                  <input 
                    type="number" 
                    defaultValue={p.stock} 
                    onBlur={(e) => {
                      if (e.target.value != p.stock) handleStockUpdate(p.id, e.target.value);
                    }}
                    className={`border p-1 w-24 rounded ${p.stock < 10 ? 'border-red-500 text-red-700 bg-red-50' : ''}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersView({ orders }) {
  const updateStatus = async (userId, orderId, status) => {
    try {
      await updateDoc(doc(db, `users/${userId}/orders`, orderId), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/orders/${orderId}`);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Manage Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="p-3 text-sm font-semibold text-gray-700">Order ID</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Date</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Total</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="p-3 text-xs text-gray-500 font-mono">{o.id}</td>
                <td className="p-3">{new Date(o.date).toLocaleDateString()}</td>
                <td className="p-3 font-medium">${o.total.toFixed(2)}</td>
                <td className="p-3">
                  <select 
                    value={o.status} 
                    onChange={(e) => updateStatus(o.userId, o.id, e.target.value)}
                    className="border p-1 rounded text-sm bg-white"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersView({ users, admins }) {
  const toggleAdmin = async (userId, isCurrentlyAdmin, email) => {
    try {
      if (isCurrentlyAdmin) {
        await deleteDoc(doc(db, 'admins', userId));
      } else {
        await setDoc(doc(db, 'admins', userId), { email, grantedAt: serverTimestamp() });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `admins/${userId}`);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Manage Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="p-3 text-sm font-semibold text-gray-700">Name</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Email</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Joined</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Admin Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => {
              const isAdmin = admins.includes(u.id) || u.email === 'rahimahisah17@gmail.com';
              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3 text-sm text-gray-500">{u.createdAt?.toDate().toLocaleDateString() || '-'}</td>
                  <td className="p-3">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={isAdmin} onChange={() => toggleAdmin(u.id, isAdmin, u.email)} disabled={u.email === 'rahimahisah17@gmail.com'} />
                        <div className={`block w-10 h-6 rounded-full ${isAdmin ? 'bg-black' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${isAdmin ? 'translate-x-4' : ''}`}></div>
                      </div>
                      {u.email === 'rahimahisah17@gmail.com' && <span className="ml-2 text-xs text-slate-400">(Super)</span>}
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
