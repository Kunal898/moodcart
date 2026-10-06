import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { createOrder } from '../services/orderService';
import { ShieldCheck, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, subtotal, fetchCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    try {
      setLoading(true);

      const items = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.products.price,
      }));

      const { data } = await createOrder({ ...form, items });

      addToast('Order placed successfully! 🎉', 'success');
      await fetchCart(); // sync empty cart
      navigate(`/orders/${data.id}`);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to place order. Please check item stock and try again.';
      setError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <p className="empty-icon">🛍️</p>
          <h2>Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Add some products before proceeding to checkout.</p>
          <Link to="/products" className="btn btn-primary btn-pill">Explore Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="page-title">Checkout & Shipping</h1>

      {error && (
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
        {/* Shipping Form */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: var_shadow_sm() }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📍 Delivery Address</span>
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="checkout-name" className="form-label">Full Name</label>
              <input
                id="checkout-name"
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="input"
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div className="form-group">
              <label htmlFor="checkout-phone" className="form-label">Phone Number</label>
              <input
                id="checkout-phone"
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                className="input"
                placeholder="10-digit mobile number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="checkout-address" className="form-label">Street Address</label>
              <input
                id="checkout-address"
                type="text"
                name="address"
                required
                value={form.address}
                onChange={handleChange}
                className="input"
                placeholder="Flat / House No., Building, Street Name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="checkout-city" className="form-label">City</label>
                <input
                  id="checkout-city"
                  type="text"
                  name="city"
                  required
                  value={form.city}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkout-pincode" className="form-label">Pincode</label>
                <input
                  id="checkout-pincode"
                  type="text"
                  name="pincode"
                  required
                  value={form.pincode}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. 400001"
                />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-full btn-lg btn-pill"
              >
                <Lock size={17} />
                {loading ? 'Securing & Placing Order...' : `Place Order • ₹${subtotal.toLocaleString('en-IN')}`}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="summary-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem' }}>Order Review</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', maxHeight: '320px', overflowY: 'auto' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <img src={item.products.image_url} alt={item.products.name} style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '4px', background: '#f8fafc' }} />
                  <div>
                    <p style={{ fontWeight: '600', maxWidth: '170px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.products.name}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Qty: {item.quantity}</p>
                  </div>
                </div>
                <span style={{ fontWeight: '700' }}>
                  ₹{(item.products.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: '#10b981', fontWeight: '700' }}>FREE</span>
          </div>

          <div className="summary-row summary-total">
            <span>Total Payable</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontWeight: '600' }}>
              <ShieldCheck size={16} /> Verified Authenticity & Warranty
            </p>
            <p>Your order will be packaged securely according to product fragile guidelines.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function var_shadow_sm() {
  return '0 1px 3px rgba(15, 23, 42, 0.05)';
}
