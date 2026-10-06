import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems, loading, removeFromWishlist, moveToCart } = useWishlist();
  const { addToast } = useToast();

  if (loading) {
    return (
      <div className="container section">
        <h1 className="page-title">My Wishlist</h1>
        <div className="skeleton" style={{ height: '300px', borderRadius: '18px' }} />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Save items that match your vibe to revisit anytime.
          </p>
          <Link to="/products" className="btn btn-primary btn-pill">
            Explore Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  async function handleMoveAllToCart() {
    for (const item of wishlistItems) {
      await moveToCart(item);
    }
    addToast('Moved all wishlist items to your cart!', 'success');
  }

  return (
    <div className="container section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>My Wishlist</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        <button onClick={handleMoveAllToCart} className="btn btn-primary btn-pill">
          <ShoppingCart size={16} /> Move All to Cart
        </button>
      </div>

      <div className="products-grid">
        {wishlistItems.map((item) => {
          const product = item.product || item;
          const productId = product.id || item.product_id;

          return (
            <div key={item.id || productId} className="product-card">
              <button
                onClick={() => removeFromWishlist(productId)}
                className="wishlist-toggle-btn wishlisted"
                title="Remove from wishlist"
                aria-label="Remove"
              >
                <Trash2 size={16} color="#ef4444" />
              </button>

              <Link to={`/products/${productId}`} className="product-card-img-wrap">
                <img
                  src={product.image_url || 'https://placehold.co/300x240?text=Item'}
                  alt={product.name}
                  className="product-card-image"
                />
              </Link>

              <div className="product-card-body">
                <span className="product-category-badge">{product.categories?.name || 'Curated'}</span>
                <Link to={`/products/${productId}`}>
                  <h3 className="product-card-title">{product.name}</h3>
                </Link>

                <div className="product-card-footer">
                  <span className="product-price">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </span>

                  <button
                    onClick={() => moveToCart(product)}
                    className="btn btn-sm btn-primary btn-pill"
                  >
                    <ShoppingCart size={15} /> Move to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
