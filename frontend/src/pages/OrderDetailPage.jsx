import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import { ArrowLeft, CheckCircle2, Clock, Truck, Package, XCircle } from 'lucide-react';

const TRACKING_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrderById(id)
      .then(({ data }) => setOrder(data))
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container section">
        <div className="skeleton" style={{ height: '320px', borderRadius: '18px' }} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container section">
        <div className="empty-state">
          <p className="empty-icon">⚠️</p>
          <h2>Order Not Found</h2>
          <p>{error || 'The requested order could not be loaded.'}</p>
          <Link to="/orders" className="btn btn-primary btn-pill" style={{ marginTop: '1rem' }}>
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const currentStepIdx = TRACKING_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="container section">
      <button onClick={() => navigate('/orders')} className="btn btn-outline btn-sm btn-pill" style={{ marginBottom: '1.25rem' }}>
        <ArrowLeft size={16} /> Back to My Orders
      </button>

      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>
              Order Confirmation
            </span>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-main)', margin: '0.2rem 0' }}>
              Order #{order.id.slice(0, 8)}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Amount</span>
            <p style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)' }}>
              ₹{Number(order.total).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Tracking Timeline Bar */}
        <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Delivery Status</h3>

          {isCancelled ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: '700' }}>
              <XCircle size={22} /> This order has been cancelled.
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              {TRACKING_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2, flex: 1 }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: isPassed ? 'var(--primary)' : '#e2e8f0',
                        color: isPassed ? '#ffffff' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: isPassed ? '700' : '500', color: isPassed ? 'var(--text-main)' : '#94a3b8', marginTop: '0.5rem', textAlign: 'center' }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Grid: Ordered Items + Shipping Address */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem' }}>Purchased Items</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {order.order_items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={item.products?.image_url || 'https://placehold.co/60x60?text=Item'}
                      alt={item.products?.name}
                      style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '4px', background: '#ffffff' }}
                    />
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{item.products?.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p style={{ fontWeight: '800', fontSize: '1rem' }}>
                    ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem' }}>Delivery Information</h2>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', lineHeight: '1.6', fontSize: '0.9rem' }}>
              <p><strong>{order.name}</strong></p>
              <p style={{ color: 'var(--text-muted)' }}>📞 {order.phone}</p>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>📍 {order.address}</p>
              <p style={{ color: 'var(--text-muted)' }}>{order.city}, {order.pincode}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
