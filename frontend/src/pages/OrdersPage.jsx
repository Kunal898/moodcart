import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/orderService';
import { Package, ArrowRight, Clock, CheckCircle2, Truck } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Order Placed', bg: '#fef3c7', text: '#b45309' },
  confirmed: { label: 'Confirmed', bg: '#e0f2fe', text: '#0369a1' },
  shipped: { label: 'In Transit', bg: '#f3e8ff', text: '#7e22ce' },
  delivered: { label: 'Delivered', bg: '#ecfdf5', text: '#047857' },
  cancelled: { label: 'Cancelled', bg: '#fee2e2', text: '#b91c1c' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrders()
      .then(({ data }) => setOrders(data || []))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container section">
        <h1 className="page-title">My Orders</h1>
        <div className="skeleton" style={{ height: '300px', borderRadius: '18px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container section">
        <div className="empty-state">
          <p className="empty-icon">⚠️</p>
          <h2>Unable to Load Orders</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>No Orders Placed Yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            When you purchase items, you'll be able to track their fulfillment and delivery right here.
          </p>
          <Link to="/products" className="btn btn-primary btn-pill">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="page-title">Order History</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {orders.map((order) => {
          const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

          return (
            <div
              key={order.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.15rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order ID:</span>{' '}
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>#{order.id.slice(0, 8)}</strong>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                    Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span
                    style={{
                      padding: '0.3rem 0.85rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      backgroundColor: status.bg,
                      color: status.text,
                    }}
                  >
                    {status.label}
                  </span>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    ₹{Number(order.total).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {order.order_items?.slice(0, 4).map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                    <img
                      src={item.products?.image_url || 'https://placehold.co/40x40?text=Item'}
                      alt={item.products?.name}
                      style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.products?.name} × {item.quantity}
                    </span>
                  </div>
                ))}
                {order.order_items?.length > 4 && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    +{order.order_items.length - 4} more
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm btn-pill">
                  View Order Details <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
