import { createContext, useContext, useState, useEffect } from 'react';
import { products as initialSeedProducts } from '../data/products';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateAuthProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  deleteDoc,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Realtime products and categories
  const [products, setProducts] = useState(initialSeedProducts);
  const defaultCats = ["Men's Shoes", "Women's Training Top", "Men's Joggers", "Running Shoes", "Men's Shorts", "Women's Jacket", "Unisex Running Shoes", "Men's Training"];
  const [categories, setCategories] = useState(defaultCats.map((c, i) => ({ id: `cat-${i}`, name: c })));
  const [loading, setLoading] = useState(true);

  // Test connection on boot and fetch global data
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();

    // Listen to Products
    const productsUnsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (snapshot.empty) {
        setProducts(initialSeedProducts);
      } else {
        const loaded = snapshot.docs.map(d => {
          const data = d.data();
          const defaultSeed = initialSeedProducts.find(p => p.id === d.id);
          // Prefer local unbranded asset if stored image is an old unsplash link
          const image = (data.image && !data.image.includes('unsplash.com')) 
            ? data.image 
            : (defaultSeed ? defaultSeed.image : data.image);
          return { id: d.id, ...data, image };
        });
        setProducts(loaded);
      }
    }, (err) => {
      console.warn("Products snapshot listener error:", err);
      setProducts(initialSeedProducts);
    });

    // Listen to Categories
    const categoriesUnsub = onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (snapshot.empty) {
        setCategories(defaultCats.map((c, i) => ({ id: `cat-${i}`, name: c })));
      } else {
        setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    }, (err) => {
      console.warn("Categories snapshot listener error:", err);
      setCategories(defaultCats.map((c, i) => ({ id: `cat-${i}`, name: c })));
    });

    return () => {
      productsUnsub();
      categoriesUnsub();
    };
  }, []);

  // Admin auto-seeding when an admin logs in and collections are empty
  useEffect(() => {
    if (!isAdmin) return;

    async function seedIfEmpty() {
      try {
        const prodSnap = await getDocs(collection(db, 'products'));
        if (prodSnap.empty) {
          for (const p of initialSeedProducts) {
            await setDoc(doc(db, 'products', p.id), {
              ...p,
              stock: 100,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        } else {
          // Update any legacy unsplash URLs on existing Firestore records
          for (const d of prodSnap.docs) {
            const data = d.data();
            const defaultSeed = initialSeedProducts.find(p => p.id === d.id);
            if (data.image && data.image.includes('unsplash.com') && defaultSeed) {
              await updateDoc(doc(db, 'products', d.id), {
                image: defaultSeed.image,
                updatedAt: serverTimestamp()
              });
            }
          }
        }
      } catch (e) {
        if (e.code === 'permission-denied') {
          console.log("Admin products seeding notice: Insufficient permissions (using client fallback state).");
        } else {
          console.warn("Admin products seeding notice:", e.message || e);
        }
      }

      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        if (catSnap.empty) {
          for (let i = 0; i < defaultCats.length; i++) {
            await setDoc(doc(db, 'categories', `cat-${i}`), {
              name: defaultCats[i],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        }
      } catch (e) {
        if (e.code === 'permission-denied') {
          console.log("Admin categories seeding notice: Insufficient permissions (using client fallback state).");
        } else {
          console.warn("Admin categories seeding notice:", e.message || e);
        }
      }
    }

    seedIfEmpty();
  }, [isAdmin]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check Admin status
        try {
          const adminDocRef = doc(db, 'admins', firebaseUser.uid);
          const adminDocSnap = await getDoc(adminDocRef);
          setIsAdmin(adminDocSnap.exists() || firebaseUser.email === 'rahimahisah17@gmail.com');
        } catch (e) {
          setIsAdmin(false);
        }

        // Fetch or create user document
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              wishlist: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
            });
            setWishlist([]);
          } else {
            const data = userDocSnap.data();
            setUser({ id: firebaseUser.uid, name: data.name, email: data.email });
            setWishlist(data.wishlist || []);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users');
        }

        // Listen to Cart
        const cartUnsubscribe = onSnapshot(
          collection(db, `users/${firebaseUser.uid}/cartItems`),
          (snapshot) => {
            const cartData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCart(cartData);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, `users/${firebaseUser.uid}/cartItems`)
        );

        // Listen to Orders
        const ordersUnsubscribe = onSnapshot(
          collection(db, `users/${firebaseUser.uid}/orders`),
          (snapshot) => {
            const orderData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            orderData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
            setOrders(orderData);
          },
          (error) => handleFirestoreError(error, OperationType.LIST, `users/${firebaseUser.uid}/orders`)
        );

        // Listen to Profile Updates (for Wishlist syncing)
        const profileUnsubscribe = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snapshot) => {
            if (snapshot.exists()) {
              setWishlist(snapshot.data().wishlist || []);
            }
          },
          (error) => handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`)
        );

        setLoading(false);

        return () => {
          cartUnsubscribe();
          ordersUnsubscribe();
          profileUnsubscribe();
        };

      } else {
        const localUser = localStorage.getItem('raikart_local_user');
        if (localUser) {
          try {
            setUser(JSON.parse(localUser));
            setLoading(false);
            return;
          } catch (e) {
            // ignore parse error
          }
        }
        setUser(null);
        try {
          const guestCart = localStorage.getItem('raikart_guest_cart');
          setCart(guestCart ? JSON.parse(guestCart) : []);
        } catch (e) {
          setCart([]);
        }
        try {
          const guestWish = localStorage.getItem('raikart_guest_wishlist');
          setWishlist(guestWish ? JSON.parse(guestWish) : []);
        } catch (e) {
          setWishlist([]);
        }
        setOrders([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper function to sync guest cart to Firestore when user logs in
  useEffect(() => {
    if (!user || user.id.startsWith('local-')) return;
    try {
      const guestCartRaw = localStorage.getItem('raikart_guest_cart');
      if (guestCartRaw) {
        const guestItems = JSON.parse(guestCartRaw);
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          (async () => {
            for (const item of guestItems) {
              const cartItemId = `${item.productId}-${item.size}-${item.color}`.replace(/[^a-zA-Z0-9_-]/g, '-');
              const cartItemRef = doc(db, `users/${user.id}/cartItems`, cartItemId);
              const cartItemSnap = await getDoc(cartItemRef);
              if (cartItemSnap.exists()) {
                await updateDoc(cartItemRef, {
                  quantity: cartItemSnap.data().quantity + (item.quantity || 1)
                });
              } else {
                await setDoc(cartItemRef, {
                  productId: item.productId,
                  size: item.size,
                  color: item.color,
                  quantity: item.quantity || 1,
                  addedAt: serverTimestamp()
                });
              }
            }
            localStorage.removeItem('raikart_guest_cart');
          })();
        }
      }
    } catch (e) {
      console.error("Guest cart migration error:", e);
    }
  }, [user]);

  // --- Auth Methods ---
  const login = async (email, password) => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('raikart_registered_users') || '{}');
      if (!storedUsers[email]) {
        throw new Error("Account not found. Please complete the Join Us form first to create an account.");
      }
      const registeredName = storedUsers[email];

      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (fbErr) {
        // Allow local session fallback if offline/unconfigured
      }

      const localUser = { id: 'local-' + Date.now(), name: registeredName, email };
      setUser(localUser);
      localStorage.setItem('raikart_local_user', JSON.stringify(localUser));
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const email = res.user.email;
      const storedUsers = JSON.parse(localStorage.getItem('raikart_registered_users') || '{}');
      if (!storedUsers[email]) {
        throw new Error("Account not found. Please complete the Join Us form first to create an account.");
      }
      const registeredName = storedUsers[email];
      const localUser = { id: 'local-' + Date.now(), name: registeredName, email };
      setUser(localUser);
      localStorage.setItem('raikart_local_user', JSON.stringify(localUser));
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    }
  }

  const register = async (name, email, password) => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('raikart_registered_users') || '{}');
      storedUsers[email] = name;
      localStorage.setItem('raikart_registered_users', JSON.stringify(storedUsers));

      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateAuthProfile(cred.user, { displayName: name });
        
        const userDocRef = doc(db, 'users', cred.user.uid);
        await setDoc(userDocRef, {
          name: name,
          email: email,
          wishlist: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (fbErr) {
        // Fallback local session registration
      }

      const localUser = { id: 'local-' + Date.now(), name, email };
      setUser(localUser);
      localStorage.setItem('raikart_local_user', JSON.stringify(localUser));
      return true;
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    localStorage.removeItem('raikart_local_user');
    setUser(null);
  };

  const updateProfile = async (name, email) => {
    if (!user) return;
    try {
      const storedUsers = JSON.parse(localStorage.getItem('raikart_registered_users') || '{}');
      storedUsers[email] = name;
      localStorage.setItem('raikart_registered_users', JSON.stringify(storedUsers));

      const updated = { ...user, name, email };
      setUser(updated);
      localStorage.setItem('raikart_local_user', JSON.stringify(updated));

      if (!user.id.startsWith('local-')) {
        const userDocRef = doc(db, 'users', user.id);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          await updateDoc(userDocRef, {
            name: name,
            email: email,
            wishlist: data.wishlist || [],
            createdAt: data.createdAt,
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  // --- Cart Methods ---
  const addToCart = async (productId, selectedSize, selectedColor, quantity = 1) => {
    const cartItemId = `${productId}-${selectedSize}-${selectedColor}`.replace(/[^a-zA-Z0-9_-]/g, '-');

    if (!user || user.id.startsWith('local-')) {
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
        try {
          if (user && user.id.startsWith('local-')) {
            localStorage.setItem('raikart_local_cart', JSON.stringify(updated));
          } else {
            localStorage.setItem('raikart_guest_cart', JSON.stringify(updated));
          }
        } catch (e) {
          console.error("Localstorage cart error:", e);
        }
        return updated;
      });
      return;
    }

    try {
      const cartItemRef = doc(db, `users/${user.id}/cartItems`, cartItemId);
      const cartItemSnap = await getDoc(cartItemRef);

      if (cartItemSnap.exists()) {
        await updateDoc(cartItemRef, {
          quantity: cartItemSnap.data().quantity + quantity,
        });
      } else {
        await setDoc(cartItemRef, {
          productId,
          size: selectedSize,
          color: selectedColor,
          quantity,
          addedAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/cartItems`);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!user || user.id.startsWith('local-')) {
      setCart(prev => {
        const updated = prev.filter(item => item.id !== cartItemId);
        try {
          if (user && user.id.startsWith('local-')) {
            localStorage.setItem('raikart_local_cart', JSON.stringify(updated));
          } else {
            localStorage.setItem('raikart_guest_cart', JSON.stringify(updated));
          }
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
      return;
    }
    try {
      await deleteDoc(doc(db, `users/${user.id}/cartItems`, cartItemId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.id}/cartItems`);
    }
  };

  const updateCartQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    if (!user || user.id.startsWith('local-')) {
      setCart(prev => {
        const updated = prev.map(item => item.id === cartItemId ? { ...item, quantity } : item);
        try {
          if (user && user.id.startsWith('local-')) {
            localStorage.setItem('raikart_local_cart', JSON.stringify(updated));
          } else {
            localStorage.setItem('raikart_guest_cart', JSON.stringify(updated));
          }
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
      return;
    }
    try {
      const cartItemRef = doc(db, `users/${user.id}/cartItems`, cartItemId);
      await updateDoc(cartItemRef, { quantity });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}/cartItems`);
    }
  };

  const clearCart = async () => {
    if (!user || user.id.startsWith('local-')) {
      setCart([]);
      try {
        if (user && user.id.startsWith('local-')) {
          localStorage.removeItem('raikart_local_cart');
        } else {
          localStorage.removeItem('raikart_guest_cart');
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }
    try {
      for (const item of cart) {
        await deleteDoc(doc(db, `users/${user.id}/cartItems`, item.id));
      }
      setCart([]);
      localStorage.removeItem('raikart_guest_cart');
      localStorage.removeItem('raikart_local_cart');
    } catch (error) {
      setCart([]);
      console.error(error);
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
      if (!user || user.id.startsWith('local-')) {
        try {
          if (user && user.id.startsWith('local-')) {
            localStorage.setItem('raikart_local_wishlist', JSON.stringify(newWishlist));
          } else {
            localStorage.setItem('raikart_guest_wishlist', JSON.stringify(newWishlist));
          }
        } catch (e) {
          console.error("Localstorage wishlist error:", e);
        }
      }
      return newWishlist;
    });

    if (user && !user.id.startsWith('local-')) {
      try {
        const userDocRef = doc(db, 'users', user.id);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          await updateDoc(userDocRef, {
            wishlist: newWishlist,
            createdAt: data.createdAt,
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.id}`);
      }
    }
  };

  // --- Order Methods ---
  const checkout = async (shippingDetails, paymentDetails) => {
    if (!user || cart.length === 0) return null;

    if (user.id.startsWith('local-')) {
      try {
        const orderId = `ORD-${Date.now()}`;
        const newOrder = {
          id: orderId,
          date: new Date().toISOString(),
          items: cart.map(item => ({ productId: item.productId, size: item.size, color: item.color, quantity: item.quantity })),
          total: getCartTotal(),
          status: 'Processing',
          shippingDetails,
          paymentDetails: { ...paymentDetails, cardNumber: `****-****-****-${paymentDetails.cardNumber?.slice(-4) || '1234'}` }
        };
        const updatedOrders = [newOrder, ...orders];
        setOrders(updatedOrders);
        localStorage.setItem('raikart_local_orders', JSON.stringify(updatedOrders));
        await clearCart();
        return orderId;
      } catch (error) {
        console.error("Local checkout error:", error);
        return null;
      }
    }

    try {
      const orderId = `ORD-${Date.now()}`;
      const orderRef = doc(db, `users/${user.id}/orders`, orderId);
      
      const safeItems = cart.map(item => ({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity
      }));

      await setDoc(orderRef, {
        date: new Date().toISOString(),
        items: safeItems,
        total: getCartTotal(),
        status: 'Processing',
        shippingDetails,
        paymentDetails: { ...paymentDetails, cardNumber: `****-****-****-${paymentDetails.cardNumber.slice(-4)}` },
        createdAt: serverTimestamp()
      });

      await clearCart();
      return orderId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.id}/orders`);
      return null;
    }
  };

  const value = {
    user, isAdmin, login, loginWithGoogle, register, logout, updateProfile,
    cart, addToCart, removeFromCart, updateCartQuantity, clearCart, getCartTotal,
    wishlist, toggleWishlist,
    orders, checkout,
    products, categories, loading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => useContext(AppContext);
