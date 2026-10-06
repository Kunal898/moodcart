import { Link, useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export default function CartPage() {
  const { cartItems, loading, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="container section">
        <h1 className="page-title">Your Cart</h1>
        <div className="skeleton" style={{ height: '240px', borderRadius: '18px' }} />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Explore our curated collections and discover items that align with your vibe.
          </p>
          <Link to="/products" className="btn btn-primary btn-pill">
            <ShoppingBag size={17} /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = subtotal >= 999 ? 0 : 99;
  const orderTotal = subtotal + shippingCost;

  return (
    <div className="container section">
      <h1 className="page-title">Shopping Cart</h1>

      <div className="cart-layout">
        {/* Items List */}
        <div className="cart-items-list">
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="summary-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem' }}>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-row">
            <span>Estimated Delivery</span>
            <span style={{ color: shippingCost === 0 ? '#10b981' : 'var(--text-main)', fontWeight: '600' }}>
              {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
            </span>
          </div>

          {subtotal < 999 && (
            <div style={{ fontSize: '0.8rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
              💡 Add ₹{(999 - subtotal).toLocaleString('en-IN')} more to unlock <strong>FREE Delivery</strong>!
            </div>
          )}

          <div className="summary-row summary-total">
            <span>Total Amount</span>
            <span>₹{orderTotal.toLocaleString('en-IN')}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-full btn-lg btn-pill"
            style={{ marginTop: '1.25rem' }}
          >
            Proceed to Checkout <ArrowRight size={17} />
          </button>

          <Link
            to="/products"
            className="btn btn-outline btn-full btn-pill"
            style={{ marginTop: '0.65rem' }}
          >
            Continue Shopping
          </Link>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} color="#10b981" /> 100% Safe & Secure Checkout
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={16} color="#2563eb" /> Fast pan-India doorstep delivery
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
