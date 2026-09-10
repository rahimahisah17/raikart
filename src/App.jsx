import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminPortal from './pages/AdminPortal.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import ContactPage from './pages/ContactPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="search" element={<ShopPage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="join" element={<RegisterPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="admin" element={<AdminPortal />} />
        <Route path="profile" element={<ProfilePage />} />
        
        <Route path="*" element={<div className="p-10 text-center text-2xl font-bold font-[Dancing Script]">Page not found</div>} />
      </Route>
    </Routes>
  );
}
