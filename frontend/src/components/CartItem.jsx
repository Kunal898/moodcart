import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Trash2 } from 'lucide-react';

export default function CartItem({ item }) {
  const { updateItem, removeItem } = useCart();
  const { addToast } = useToast();

  const product = item.products || {};
  const lineTotal = Number(product.price || 0) * item.quantity;

  async function handleIncrease() {
    if (product.stock && item.quantity >= product.stock) {
      addToast(`Only ${product.stock} items available in stock.`, 'warning');
      return;
    }
    await updateItem(item.id, item.quantity + 1);
  }

  async function handleDecrease() {
    if (item.quantity === 1) {
      await removeItem(item.id);
      addToast(`Removed "${product.name}" from cart`, 'info');
    } else {
      await updateItem(item.id, item.quantity - 1);
    }
  }

  async function handleRemove() {
    await removeItem(item.id);
    addToast(`Removed "${product.name}" from cart`, 'info');
  }

  return (
    <div className="cart-item-card">
      <img
        src={product.image_url || 'https://placehold.co/80x80?text=Item'}
        alt={product.name}
        className="cart-item-thumb"
      />

      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
          {product.name}
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          ₹{Number(product.price || 0).toLocaleString('en-IN')} each
        </p>
        {product.mood && (
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: '#f1f5f9', fontWeight: '600', marginTop: '0.35rem', display: 'inline-block' }}>
            {product.mood} vibe
          </span>
        )}
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: '#ffffff' }}>
        <button
          onClick={handleDecrease}
          style={{ width: '32px', height: '32px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span style={{ width: '36px', textAlign: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
          {item.quantity}
        </span>
        <button
          onClick={handleIncrease}
          style={{ width: '32px', height: '32px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <div style={{ minWidth: '90px', textAlign: 'right', fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>
        ₹{lineTotal.toLocaleString('en-IN')}
      </div>

      <button
        onClick={handleRemove}
        style={{ color: '#94a3b8', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
        title="Remove item"
        aria-label="Remove item"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
