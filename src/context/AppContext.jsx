import { createContext, useContext, useState, useEffect } from 'react';
import { products as initialSeedProducts } from '../data/products';
import { auth } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithCredential,
  GoogleAuthProvider, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateAuthProfile
} from 'firebase/auth';

// Admin allowlist (frontend gate). Mirrors the server-side ADMIN_EMAILS env var.
// Set VITE_ADMIN_EMAILS in .env (comma-separated) to control access from env.
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'rahimahisah17@gmail.com')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

// Strict, case-insensitive email allowlist check. This is the single source of
// truth for admin access on the frontend (mirrors the server-side ADMIN_EMAILS).
const isAdminEmail = (email) => {
  const normalized = (email || '').trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized);
};

// Display names should use only the first name (not the full name entered
// during sign-up). E.g. "Halimah Dammy" -> "Halimah".
const firstName = (fullName) => (fullName || '').trim().split(/\s+/)[0];

// LocalStorage keys. Firestore has been removed — Firebase is used for Auth only,
// and the dummy catalog + local storage are the source of truth until PostgreSQL.
const KEYS = {
  registeredUsers: 'raikart_registered_users',
  localUser: 'raikart_local_user',
  guestCart: 'raikart_guest_cart',
  guestWishlist: 'raikart_guest_wishlist',
  userCart: 'raikart_user_cart',
  userWishlist: 'raikart_user_wishlist',
  userOrders: 'raikart_user_orders',
  products: 'raikart_products',
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Ignore quota/security errors and keep working in memory.
  }
}

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Dummy catalog is the single source of truth (Firestore removed — Firebase is
  // used for authentication only). The local seed product images are always used.
  // Stock is tracked here (persisted to localStorage and shared with the Admin
  // Portal) so each purchase decrements inventory.
  const [products, setProducts] = useState(() => {
    const stored = readJSON(KEYS.products, null);
    if (Array.isArray(stored) && stored.length > 0) return stored;
    // One-time migration: reuse the existing admin catalog if present.
    const legacy = readJSON('raikart_admin_products', null);
    if (Array.isArray(legacy) && legacy.length > 0) {
      return legacy.map((p) => ({
        ...p,
        stock: typeof p.stock === 'number' ? p.stock : 100,
      }));
    }
    return initialSeedProducts.map((p) => ({
      ...p,
      stock: typeof p.stock === 'number' ? p.stock : 100,
    }));
  });

  const defaultCats = ["Men's Shoes", "Women's Training Top", "Men's Joggers", "Running Shoes", "Men's Shorts", "Women's Jacket", "Unisex Running Shoes", "Men's Training"];
  const categories = defaultCats.map((c, i) => ({ id: `cat-${i}`, name: c }));
  const [loading, setLoading] = useState(true);

  // Persist product inventory so the storefront and the Admin Portal (Inventory
  // view) always read the same stock.
  useEffect(() => {
    writeJSON(KEYS.products, products);
  }, [products]);

  // (Firestore product/category loading and admin auto-seeding were removed —
  // the dummy catalog is the single source of truth. Firebase is Auth-only.)

  // Auth Listener — Firebase is used for authentication only. User profile,
  // cart, wishlist and orders are persisted in localStorage (no Firestore).
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Check Admin status — the email allowlist is authoritative.
        setIsAdmin(isAdminEmail(firebaseUser.email));

        // Resolve the user's display name. Prefer the name the user entered
        // when joining (persisted locally on registration), then the Firebase
        // displayName, and only fall back to the email prefix as a last resort.
        const email = firebaseUser.email || '';
        const storedUsers = readJSON(KEYS.registeredUsers, {});
        const registeredName = storedUsers[email.toLowerCase()] || storedUsers[email] || '';
        const name = firstName(firebaseUser.displayName || registeredName || email.split('@')[0]);

        setUser({
          id: firebaseUser.uid,
          name,
          email: firebaseUser.email,
        });

        // Load persisted cart/wishlist/orders for the signed-in user.
        setCart(readJSON(KEYS.userCart, []));
        setWishlist(readJSON(KEYS.userWishlist, []));
        setOrders(readJSON(KEYS.userOrders, []));
        setLoading(false);
      } else {
        setIsAdmin(false);

        // Local demo session (created via the offline register/login fallback).
        const localUser = readJSON(KEYS.localUser, null);
        if (localUser) {
          setUser({ ...localUser, name: firstName(localUser.name) });
          setIsAdmin(isAdminEmail(localUser.email));
          setCart(readJSON(KEYS.userCart, []));
          setWishlist(readJSON(KEYS.userWishlist, []));
          setOrders(readJSON(KEYS.userOrders, []));
          setLoading(false);
          return;
        }

        setUser(null);
        setCart(readJSON(KEYS.guestCart, []));
        setWishlist(readJSON(KEYS.guestWishlist, []));
        setOrders([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Migrate a guest cart/wishlist into the signed-in user's localStorage on login.
  useEffect(() => {
    if (!user) return;
    try {
      const guestCart = readJSON(KEYS.guestCart, []);
      if (Array.isArray(guestCart) && guestCart.length > 0) {
        const mergedCart = [...guestCart, ...readJSON(KEYS.userCart, [])];
        writeJSON(KEYS.userCart, mergedCart);
        setCart(mergedCart);
        localStorage.removeItem(KEYS.guestCart);
      }
      const guestWishlist = readJSON(KEYS.guestWishlist, []);
      if (Array.isArray(guestWishlist) && guestWishlist.length > 0) {
        const mergedWishlist = [...new Set([...guestWishlist, ...readJSON(KEYS.userWishlist, [])])];
        writeJSON(KEYS.userWishlist, mergedWishlist);
        setWishlist(mergedWishlist);
        localStorage.removeItem(KEYS.guestWishlist);
      }
    } catch (e) {
      console.error("Guest cart migration error:", e);
    }
  }, [user]);

  // --- Auth Methods ---
  const login = async (email, password) => {
    try {
      // Firebase Authentication is the source of truth.
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener sets the real user + admin flag.
      return true;
    } catch (fbErr) {
      // Offline / unconfigured fallback: local demo session.
      const storedUsers = readJSON(KEYS.registeredUsers, {});
      if (!storedUsers[email]) {
        alert("Account not found. Please complete the Join Us form first to create an account.");
        return false;
      }
      const localUser = { id: 'local-' + Date.now(), name: firstName(storedUsers[email]), email };
      setUser(localUser);
      setIsAdmin(isAdminEmail(email));
      writeJSON(KEYS.localUser, localUser);
      setCart(readJSON(KEYS.userCart, []));
      setWishlist(readJSON(KEYS.userWishlist, []));
      setOrders(readJSON(KEYS.userOrders, []));
      return true;
    }
  };

  // Sign in with a Google ID token obtained from Google Identity Services (GIS).
  // GIS returns the ID token directly via a callback (no popup/redirect iframe),
  // which is far more reliable than Firebase's signInWithPopup/signInWithRedirect
  // flows when third-party cookies or the gapi iframe are blocked.
  const signInWithGoogle = async (idToken) => {
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
    // onAuthStateChanged picks up the new user and sets user/loading.
    return true;
  }

  const register = async (name, email, password) => {
    try {
      const storedUsers = readJSON(KEYS.registeredUsers, {});
      storedUsers[email] = firstName(name);
      writeJSON(KEYS.registeredUsers, storedUsers);

      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateAuthProfile(cred.user, { displayName: firstName(name) });
        // The onAuthStateChanged listener sets the real user + admin flag.
        return true;
      } catch (fbErr) {
        // Offline / unconfigured fallback: local demo session.
        const localUser = { id: 'local-' + Date.now(), name: firstName(name), email };
        setUser(localUser);
        setIsAdmin(isAdminEmail(email));
        writeJSON(KEYS.localUser, localUser);
        setCart(readJSON(KEYS.userCart, []));
        setWishlist(readJSON(KEYS.userWishlist, []));
        setOrders(readJSON(KEYS.userOrders, []));
        return true;
      }
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    localStorage.removeItem(KEYS.localUser);
    setUser(null);
    setIsAdmin(false);
    setCart(readJSON(KEYS.guestCart, []));
    setWishlist(readJSON(KEYS.guestWishlist, []));
    setOrders([]);
  };

  const updateProfile = async (name, email) => {
    if (!user) return;
    try {
      const storedUsers = readJSON(KEYS.registeredUsers, {});
      storedUsers[email] = firstName(name);
      writeJSON(KEYS.registeredUsers, storedUsers);

      const updated = { ...user, name: firstName(name), email };
      setUser(updated);
      writeJSON(KEYS.localUser, updated);
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  // --- Cart Methods (localStorage persistence) ---
  const persistCart = (currentUser, items) => {
    writeJSON(currentUser ? KEYS.userCart : KEYS.guestCart, items);
  };

  const addToCart = async (productId, selectedSize, selectedColor, quantity = 1) => {
    const cartItemId = `${productId}-${selectedSize}-${selectedColor}`.replace(/[^a-zA-Z0-9_-]/g, '-');

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === cartItemId);
      let updated;
      if (existingIndex > -1) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
      } else {
        updated = [
          ...prev,
          {
            id: cartItemId,
            productId,
            size: selectedSize,
            color: selectedColor,
            quantity,
            addedAt: new Date().toISOString()
          }
        ];
      }
      persistCart(user, updated);
      return updated;
    });
  };

  const removeFromCart = async (cartItemId) => {
    setCart(prev => {
      const updated = prev.filter(item => item.id !== cartItemId);
      persistCart(user, updated);
      return updated;
    });
  };

  const updateCartQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    setCart(prev => {
      const updated = prev.map(item => item.id === cartItemId ? { ...item, quantity } : item);
      persistCart(user, updated);
      return updated;
    });
  };

  const clearCart = async () => {
    setCart([]);
    if (user) {
      localStorage.removeItem(KEYS.userCart);
    } else {
      localStorage.removeItem(KEYS.guestCart);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  // --- Wishlist Methods ---
  const toggleWishlist = async (productId) => {
    let newWishlist = [];
    setWishlist(prev => {
      const exists = prev.includes(productId);
      newWishlist = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      writeJSON(user ? KEYS.userWishlist : KEYS.guestWishlist, newWishlist);
      return newWishlist;
    });
  };

  // --- Order Methods ---
  const checkout = async (shippingDetails, paymentDetails) => {
    if (!user || cart.length === 0) return null;

    try {
      const orderId = `ORD-${Date.now()}`;
      const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        items: cart.map(item => ({ productId: item.productId, size: item.size, color: item.color, quantity: item.quantity })),
        total: getCartTotal(),
        status: 'Processing',
        shippingDetails,
        paymentDetails: {
          ...paymentDetails,
          // Only mask the card number when one was actually captured (Paystack
          // payments don't collect a card number, so don't fabricate one).
          ...(paymentDetails?.cardNumber
            ? { cardNumber: `****-****-****-${String(paymentDetails.cardNumber).slice(-4)}` }
            : {})
        }
      };
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      writeJSON(KEYS.userOrders, updatedOrders);

      // Decrement inventory so each purchase reduces the available stock.
      setProducts((prev) =>
        prev.map((p) => {
          const line = cart.find((ci) => ci.productId === p.id);
          if (!line) return p;
          const current = typeof p.stock === 'number' ? p.stock : 100;
          return { ...p, stock: Math.max(0, current - line.quantity) };
        })
      );

      await clearCart();
      return orderId;
    } catch (error) {
      console.error("Checkout error:", error);
      return null;
    }
  };

  const value = {
    user, isAdmin, login, signInWithGoogle, register, logout, updateProfile,
    cart, addToCart, removeFromCart, updateCartQuantity, clearCart, getCartTotal,
    wishlist, toggleWishlist,
    orders, checkout,
    products, setProducts, categories, loading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => useContext(AppContext);
