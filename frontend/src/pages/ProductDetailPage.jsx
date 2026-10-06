import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById, getProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { getMoodMatchScore } from '../utils/moodLogic';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingCart, Check, ArrowLeft, Plus, Sparkles, Layers } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [vibeBundle, setVibeBundle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addingBundle, setAddingBundle] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');
        const { data } = await getProductById(id);
        setProduct(data);

        // Fetch related products and bundle candidates from the same mood / category
        const { data: catalog } = await getProducts({ mood: data.mood });
        const filtered = (catalog || []).filter((p) => p.id !== data.id);
        setRelatedProducts(filtered.slice(0, 4));
        setVibeBundle(filtered.slice(0, 2));
      } catch {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      addToast('Please sign in to add products to your cart.', 'warning');
      navigate('/login');
      return;
    }

    try {
      setAdding(true);
      await addItem(product.id, quantity);
      setAdded(true);
      addToast(`Added ${quantity} × "${product.name}" to cart!`, 'success');
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to add to cart.', 'error');
    } finally {
      setAdding(false);
    }
  }

  // "Complete the Vibe" — Add All to Database Cart
  async function handleAddBundleToCart() {
    if (!user) {
      addToast('Please sign in to add bundle to your cart.', 'warning');
      navigate('/login');
      return;
    }

    try {
      setAddingBundle(true);
      // Add primary product
      await addItem(product.id, 1);
      // Add complementary bundle products
      for (const item of vibeBundle) {
        await addItem(item.id, 1);
      }
      addToast('Added Complete Vibe Bundle to cart!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to add bundle to cart.', 'error');
    } finally {
      setAddingBundle(false);
    }
  }

  if (loading) {
    return (
      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="skeleton" style={{ height: '420px', borderRadius: '18px' }} />
          <div>
            <div className="skeleton" style={{ height: '24px', width: '30%', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: '36px', width: '80%', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: '28px', width: '40%', marginBottom: '1.5rem' }} />
            <div className="skeleton" style={{ height: '100px', width: '100%', marginBottom: '1.5rem' }} />
            <div className="skeleton" style={{ height: '50px', width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container section">
        <div className="empty-state">
          <p className="empty-icon">⚠️</p>
          <h2>Product Not Found</h2>
          <p>{error || 'The requested product could not be located.'}</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const wishlisted = isWishlisted(product.id);
  const matchScore = getMoodMatchScore(product.mood, product.mood, product.id);

  // Bundle Total
  const bundleTotalPrice = Number(product.price) + vibeBundle.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div className="container section">
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="product-detail-layout">
        {/* Product Image Gallery / Preview */}
        <div className="product-detail-img-box">
          <img
            src={product.image_url || 'https://placehold.co/500x400?text=No+Image'}
            alt={product.name}
            className="product-detail-img"
          />
        </div>

        {/* Product Details Info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Metadata badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {product.categories?.name && (
              <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                {product.categories.name}
              </span>
            )}
            {product.mood && (
              <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '0.2rem 0.65rem', borderRadius: '9999px', background: '#eff6ff', color: 'var(--primary)' }}>
                ✨ {product.mood.toUpperCase()} VIBE
              </span>
            )}
            <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '0.2rem 0.65rem', borderRadius: '9999px', background: '#ecfdf5', color: '#047857' }}>
              {matchScore}% Mood Match
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.75rem', lineHeight: '1.2' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <span style={{ fontSize: '1.15rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                ₹{Number(product.original_price).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {product.description || 'Premium curated product designed for comfort, productivity, and modern lifestyle.'}
          </p>

          {/* Stock Availability status */}
          <div style={{ marginBottom: '1.5rem' }}>
            {isOutOfStock ? (
              <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.9rem' }}>❌ Out of Stock</span>
            ) : isLowStock ? (
              <span style={{ color: '#ea580c', fontWeight: '700', fontSize: '0.9rem' }}>⚠️ Low Stock: Only {product.stock} items left!</span>
            ) : (
              <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.9rem' }}>✓ In Stock ({product.stock} available)</span>
            )}
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Quantity:</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: '#ffffff' }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ width: '36px', height: '36px', fontSize: '1.1rem', fontWeight: '700' }}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, Number(e.target.value))))}
                  style={{ width: '48px', textAlign: 'center', border: 'none', outline: 'none', fontWeight: '700' }}
                />
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  style={{ width: '36px', height: '36px', fontSize: '1.1rem', fontWeight: '700' }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '0.85rem', marginTop: 'auto', flexWrap: 'wrap' }}>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              className={`btn btn-lg ${isOutOfStock ? 'btn-disabled' : added ? 'btn-success' : 'btn-primary'}`}
              style={{ flex: 1, minWidth: '180px', borderRadius: 'var(--radius-full)' }}
            >
              {added ? <Check size={18} /> : <ShoppingCart size={18} />}
              {isOutOfStock ? 'Out of Stock' : adding ? 'Adding to Cart...' : added ? 'Added to Cart!' : 'Add to Cart'}
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className="btn btn-outline btn-lg"
              style={{ borderRadius: 'var(--radius-full)', padding: '0.85rem 1.25rem' }}
              title="Save to Wishlist"
            >
              <Heart size={20} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : '#64748b'} />
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================
          COMPLETE THE VIBE BUNDLE (Requirement #11)
          ================================================================= */}
      {vibeBundle.length > 0 && (
        <section className="complete-vibe-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Layers size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Complete the Vibe
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Elevate the moment. Pair this item with harmonized products from the same mood collection.
          </p>

          <div className="complete-vibe-grid">
            {/* Item 1: This Product */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#ffffff', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', minWidth: '220px' }}>
              <img src={product.image_url} alt={product.name} style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>₹{Number(product.price).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <Plus size={20} color="#94a3b8" />

            {/* Bundle Items */}
            {vibeBundle.map((item, idx) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#ffffff', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', minWidth: '220px' }}>
                  <img src={item.image_url} alt={item.name} style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '700', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>₹{Number(item.price).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                {idx < vibeBundle.length - 1 && <Plus size={20} color="#94a3b8" />}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bundle Total:</span>{' '}
              <strong style={{ fontSize: '1.35rem', color: 'var(--text-main)' }}>₹{bundleTotalPrice.toLocaleString('en-IN')}</strong>
            </div>

            <button
              onClick={handleAddBundleToCart}
              disabled={addingBundle}
              className="btn btn-secondary btn-pill"
            >
              <Sparkles size={16} /> {addingBundle ? 'Adding Bundle...' : 'Add All to Cart'}
            </button>
          </div>
        </section>
      )}

      {/* Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <h2 className="section-title">More {product.mood ? `${product.mood.toUpperCase()} Picks` : 'Related Products'}</h2>
          <div className="products-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} targetMood={product.mood} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
