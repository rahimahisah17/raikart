import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Warehouse, ShoppingCart, Users, X, ShieldCheck, CreditCard, Star, Settings, LogOut, Search, Eye, Trash2, Ban, UserCheck, RefreshCw } from 'lucide-react';
import defaultProductImg from '../assets/images/raikart_air_max_1788860931144.jpg';
import { useAppContext } from '../context/AppContext';
import { auth } from '../firebase';
import CloudinaryUploader from '../components/CloudinaryUploader';
import { destroyImage, extractPublicIdFromUrl } from '../services/cloudinaryService';
import { listUsers, setUserStatus, deleteUser } from '../services/adminService';

// Persist admin-only data to localStorage for now (Firestore removed;
// PostgreSQL will become the persistent database later).
function usePersistedState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Ignore corrupt/stale data and fall back to the seed.
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      // Storage unavailable — keep working in memory.
    }
  }, [key, state]);

  return [state, setState];
}

export default function AdminPortal() {
  const { user, isAdmin, loading, products, setProducts, categories: seedCategories, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Products (and their stock) come from the shared AppContext catalog, so the
  // storefront and the Admin Portal read/write the same inventory. Categories
  // are admin-local, seeded from the mock catalog.
  const [categories, setCategories] = usePersistedState('raikart_admin_categories', seedCategories);

  // Orders are read from the same localStorage key the checkout flow writes to
  // (`raikart_user_orders`), so the Dashboard, Orders and Payments views stay in
  // sync with real customer orders. PostgreSQL will replace this later.
  const [allOrders, setAllOrders] = usePersistedState('raikart_user_orders', []);

  // Users are REAL Firebase Authentication users, fetched via the Admin SDK.
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');

  const refreshUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await listUsers();
      setUsers(data.users || []);
    } catch (e) {
      setUsersError(e.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) refreshUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 border border-red-200 mb-4">
          <ShieldCheck className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Unauthorized</h1>
        <p className="text-slate-600 mb-1">
          You are signed in as <span className="font-bold text-black">{user?.email}</span>.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          This account is not authorized to access the Admin Portal.
        </p>
        <Link
          to="/"
          className="inline-block bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'inventory', label: 'Inventory', icon: Warehouse },
    { id: 'settings', label: 'Settings', icon: Settings },
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
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-2 border-t border-gray-100 pt-4"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6 overflow-hidden">
        {activeTab === 'dashboard' && <DashboardView orders={allOrders} users={users} products={products} />}
        {activeTab === 'users' && <UsersView users={users} loading={usersLoading} error={usersError} onRefresh={refreshUsers} />}
        {activeTab === 'products' && <ProductsView products={products} setProducts={setProducts} categories={categories} />}
        {activeTab === 'categories' && <CategoriesView categories={categories} setCategories={setCategories} />}
        {activeTab === 'orders' && <OrdersView orders={allOrders} setOrders={setAllOrders} />}
        {activeTab === 'payments' && <PaymentsView orders={allOrders} />}
        {activeTab === 'reviews' && <ReviewsView products={products} />}
        {activeTab === 'inventory' && <InventoryView products={products} setProducts={setProducts} />}
        {activeTab === 'settings' && <SettingsView />}
      </div>
    </div>
  );
}

function DashboardView({ orders, users, products }) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const cards = [
    { label: 'Total Users', value: users.length, icon: Users },
    { label: 'Total Products', value: products.length, icon: Package },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart },
    { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: LayoutDashboard },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Dashboard Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{c.label}</p>
                <p className="text-2xl font-bold">{c.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductsView({ products, setProducts, categories }) {
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
      price: (typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0).toString(), 
      stock: (p.stock ?? 0).toString(),
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

  const handleSave = (e) => {
    e.preventDefault();
    const isNew = editingId === 'new' || !editingId;
    const id = isNew ? `prod-${Date.now()}` : editingId;
    
    const parsedColors = form.colorsInput.split(',').map(c => c.trim()).filter(Boolean);
    const parsedSizes = form.sizesInput.split(',').map(s => s.trim()).filter(Boolean);

    const productData = {
      name: form.name,
      category: form.category || categories[0]?.name || 'Uncategorized',
      gender: form.gender || 'unisex',
      price: parseFloat(form.price) || 0,
      description: form.description || 'Premium Raikart clothing apparel.',
      image: form.image || defaultProductImg,
      colors: parsedColors.length > 0 ? parsedColors : ['Black', 'White'],
      sizes: parsedSizes.length > 0 ? parsedSizes : ['S', 'M', 'L'],
      stock: parseInt(form.stock) || 0,
      updatedAt: new Date().toISOString()
    };

    setProducts((prev) => {
      const exists = prev.some((p) => p.id === id);
      if (exists) {
        return prev.map((p) => (p.id === id ? { ...p, ...productData } : p));
      }
      return [...prev, { id, ...productData, createdAt: new Date().toISOString() }];
    });
    resetForm();
  };

  const handleDelete = (p) => {
    if (confirm('Delete this product?')) {
      setProducts((prev) => prev.filter((item) => item.id !== p.id));
      // Best-effort: delete the associated Cloudinary asset (admin-created products).
      const publicId = extractPublicIdFromUrl(p.image);
      if (publicId) {
        (async () => {
          try {
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
            await destroyImage(publicId, token);
          } catch (err) {
            console.warn('Cloudinary cleanup skipped:', err.message || err);
          }
        })();
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
                  <td className="p-3">${Number(p.price || 0).toFixed(2)}</td>
                  <td className="p-3">
                    <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDelete(p)} className="text-red-600 hover:underline">Delete</button>
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

function CategoriesView({ categories, setCategories }) {
  const [name, setName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = `cat-${Date.now()}`;
    setCategories((prev) => [...prev, { id, name: name.trim() }]);
    setName('');
  };

  const handleDelete = (id) => {
    if (confirm('Delete this category?')) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
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

function InventoryView({ products, setProducts }) {
  const handleStockUpdate = (id, newStock) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: parseInt(newStock) || 0 } : p)));
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
                    defaultValue={p.stock ?? 0} 
                    onBlur={(e) => {
                      if (e.target.value != p.stock) handleStockUpdate(p.id, e.target.value);
                    }}
                    className={`border p-1 w-24 rounded ${(p.stock ?? 0) < 10 ? 'border-red-500 text-red-700 bg-red-50' : ''}`}
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

function OrdersView({ orders, setOrders }) {
  const updateStatus = (orderId, status) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
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
                <td className="p-3 font-medium">${Number(o.total || 0).toFixed(2)}</td>
                <td className="p-3">
                  <select 
                    value={o.status} 
                    onChange={(e) => updateStatus(o.id, e.target.value)}
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

const PROVIDER_LABELS = {
  password: 'Email / Password',
  'google.com': 'Google',
  'facebook.com': 'Facebook',
  'github.com': 'GitHub',
  'twitter.com': 'Twitter',
  'apple.com': 'Apple',
  phone: 'Phone',
};

function providerLabel(p) {
  return PROVIDER_LABELS[p] || p;
}

function fmtDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function UserAvatar({ name, email, photoURL }) {
  const initial = (name || email || '?').charAt(0).toUpperCase();
  if (photoURL) {
    return <img src={photoURL} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-200" />;
  }
  return (
    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
      {initial}
    </div>
  );
}

function UsersView({ users, loading, error, onRefresh }) {
  const [search, setSearch] = useState('');
  const [selectedUid, setSelectedUid] = useState(null);
  const [busyUid, setBusyUid] = useState(null);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? users.filter((u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.uid || '').toLowerCase().includes(q)
      )
    : users;

  const selected = selectedUid ? users.find((u) => u.uid === selectedUid) : null;

  const handleToggleStatus = async (u) => {
    const action = u.disabled ? 'enable' : 'disable';
    if (!confirm(`${u.disabled ? 'Enable' : 'Disable'} ${u.email || u.name}?`)) return;
    setBusyUid(u.uid);
    try {
      await setUserStatus(u.uid, !u.disabled);
      await onRefresh();
    } catch (err) {
      alert(err.message || `Failed to ${action} user`);
    } finally {
      setBusyUid(null);
    }
  };

  const handleDelete = async (u) => {
    if (!confirm(`Permanently delete ${u.email || u.name}? This cannot be undone.`)) return;
    setBusyUid(u.uid);
    try {
      await deleteUser(u.uid);
      if (selectedUid === u.uid) setSelectedUid(null);
      await onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setBusyUid(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Manage Users</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or UID…"
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-sm text-slate-500">Loading users…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-700">User</th>
                <th className="p-3 text-sm font-semibold text-gray-700">UID</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Provider</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Verified</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Status</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Joined</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Last Sign-in</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-sm text-slate-500">
                    {q ? 'No users match your search.' : 'No users yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.name} email={u.email} photoURL={u.photoURL} />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{u.name || '—'}</p>
                          <p className="text-sm text-gray-500 truncate">{u.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-gray-500 font-mono max-w-[140px] truncate" title={u.uid}>
                      {u.uid}
                    </td>
                    <td className="p-3 text-sm text-gray-600">{providerLabel(u.provider)}</td>
                    <td className="p-3">
                      {u.emailVerified ? (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Unverified</span>
                      )}
                    </td>
                    <td className="p-3">
                      {u.disabled ? (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">Disabled</span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Enabled</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-500">{fmtDate(u.createdAt)}</td>
                    <td className="p-3 text-sm text-gray-500">{fmtDate(u.lastSignInAt)}</td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedUid(u.uid)}
                        className="text-blue-600 hover:underline mr-2 inline-flex items-center gap-1"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={busyUid === u.uid}
                        className="text-gray-600 hover:underline mr-2 inline-flex items-center gap-1 disabled:opacity-50"
                        title={u.disabled ? 'Enable user' : 'Disable user'}
                      >
                        {u.disabled ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        {u.disabled ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={busyUid === u.uid}
                        className="text-red-600 hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <UserDetailsModal user={selected} onClose={() => setSelectedUid(null)} />
      )}
    </div>
  );
}

function UserDetailsModal({ user, onClose }) {
  const rows = [
    { label: 'Name', value: user.name || '—' },
    { label: 'Email', value: user.email || '—' },
    { label: 'Firebase UID', value: user.uid || '—' },
    { label: 'Authentication Provider', value: providerLabel(user.provider) },
    { label: 'Email Verification', value: user.emailVerified ? 'Verified' : 'Unverified' },
    { label: 'Account Status', value: user.disabled ? 'Disabled' : 'Enabled' },
    { label: 'Registration Date', value: fmtDate(user.createdAt) },
    { label: 'Last Sign-in', value: fmtDate(user.lastSignInAt) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4 mb-6">
          <UserAvatar name={user.name} email={user.email} photoURL={user.photoURL} />
          <div>
            <h3 className="text-lg font-bold">{user.name || 'Unnamed user'}</h3>
            <p className="text-sm text-gray-500">{user.email || '—'}</p>
          </div>
        </div>
        <dl className="space-y-3">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-4 text-sm">
              <dt className="text-gray-500 font-medium shrink-0">{r.label}</dt>
              <dd className="text-gray-800 text-right break-all">{r.value}</dd>
            </div>
          ))}
        </dl>
        {user.photoURL && (
          <img src={user.photoURL} alt="Profile" className="mt-4 w-full max-h-40 object-cover rounded-md border border-gray-100" />
        )}
      </div>
    </div>
  );
}

function PaymentsView({ orders }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Payments</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-slate-500">No payments recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-700">Payment Reference</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Customer</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Method</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Amount</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="p-3 text-xs text-gray-500 font-mono">{o.paymentDetails?.reference || o.id}</td>
                  <td className="p-3 font-medium">
                    {o.shippingDetails?.name || o.shippingDetails?.email || '-'}
                    {o.shippingDetails?.email && o.shippingDetails?.name ? (
                      <span className="block text-xs text-gray-400">{o.shippingDetails.email}</span>
                    ) : null}
                  </td>
                  <td className="p-3 text-gray-600">
                    {o.paymentDetails?.method || 'Paystack'}
                    {o.paymentDetails?.channel ? ` • ${o.paymentDetails.channel}` : ''}
                  </td>
                  <td className="p-3 font-medium">${Number(o.total || 0).toFixed(2)}</td>
                  <td className="p-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {(o.paymentDetails?.status === 'paid' || o.status !== 'Cancelled') ? 'Paid' : 'Unpaid'}
                    </span>
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

const MOCK_REVIEWS = [
  { id: 'rev-1', product: 'Raikart Pro Dri-FIT Training Top', author: 'Amina B.', rating: 5, comment: 'Amazing quality, fits perfectly. Fast delivery too!', date: '2026-09-01' },
  { id: 'rev-2', product: 'Raikart Pastel Pink Active Tee', author: 'John K.', rating: 4, comment: 'Great material, colors are vibrant.', date: '2026-09-03' },
  { id: 'rev-3', product: 'Raikart Rose Gold Sheen Workout Tank', author: 'Sara L.', rating: 5, comment: 'Love it! Very comfortable for workouts.', date: '2026-09-05' },
];

function ReviewsView() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Product Reviews</h2>
      <div className="space-y-4">
        {MOCK_REVIEWS.map(r => (
          <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex items-center justify-between">
              <p className="font-bold">{r.product}</p>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">"{r.comment}"</p>
            <p className="text-xs text-slate-400 mt-2">{r.author} • {r.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Settings</h2>
      <div className="space-y-6 max-w-xl">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Store Name</label>
          <input type="text" defaultValue="Raikart" className="border p-2 rounded w-full" />
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Support Email</label>
          <input type="email" defaultValue="support@raikart.com" className="border p-2 rounded w-full" />
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Currency</label>
          <select className="border p-2 rounded w-full">
            <option value="USD">USD ($)</option>
            <option value="NGN">NGN (₦)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded text-sm font-medium">Save Settings</button>
      </div>
    </div>
  );
}
