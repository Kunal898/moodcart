import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MoodFinderModal from './components/MoodFinderModal';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [isMoodFinderOpen, setIsMoodFinderOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <div className="app-wrapper">
                <Navbar onOpenMoodFinder={() => setIsMoodFinderOpen(true)} />

                <main style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<HomePage onOpenMoodFinder={() => setIsMoodFinderOpen(true)} />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route path="/cart" element={
                      <ProtectedRoute><CartPage /></ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                      <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute><OrdersPage /></ProtectedRoute>
                    } />
                    <Route path="/orders/:id" element={
                      <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                <Footer />

                {/* Global Interactive Mood Finder Wizard */}
                <MoodFinderModal
                  isOpen={isMoodFinderOpen}
                  onClose={() => setIsMoodFinderOpen(false)}
                />
              </div>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
