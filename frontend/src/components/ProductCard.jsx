import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { getMoodMatchScore } from '../utils/moodLogic';
import { Heart, ShoppingCart, Check } from 'lucide-react';

export default function ProductCard({ product, targetMood }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  // Mini preview thumbnails (as seen in the reference mockup)
  // Product image + subtle variations
  const mainImage = product.image_url || 'https://placehold.co/300x240?text=No+Image';
  const previewImages = [
    mainImage,
    // Variations for thumbnail selector experience
    mainImage,
    mainImage,
  ];

  const currentPreview = previewImages[selectedImgIdx] || mainImage;
  const matchScore = getMoodMatchScore(product.mood, targetMood, product.id);
  const wishlisted = isWishlisted(product.id);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  async function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      addToast('Please log in to add items to your cart.', 'warning');
      navigate('/login');
      return;
    }

    if (isOutOfStock) return;

    try {
      setAdding(true);
      await addItem(product.id, 1);
      setAdded(true);
      addToast(`Added "${product.name}" to cart!`, 'success');
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to add item to cart.', 'error');
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlistToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    const nowWishlisted = await toggleWishlist(product);
    if (nowWishlisted) {
      addToast(`Added to your wishlist ❤️`, 'success');
    } else {
      addToast(`Removed from wishlist`, 'info');
    }
  }

  return (
    <div className="product-card">
      {/* Mood Match Score Pill */}
      {product.mood && (
        <div className="mood-match-pill" title={`Mood: ${product.mood}`}>
          {matchScore}% Match
        </div>
      )}

      {/* Floating Wishlist Heart Button */}
      <button
        onClick={handleWishlistToggle}
        className={`wishlist-toggle-btn ${wishlisted ? 'wishlisted' : ''}`}
        title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-label="Wishlist"
      >
        <Heart size={16} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : '#64748b'} />
      </button>

      {/* Main Product Image Container */}
      <Link to={`/products/${product.id}`} className="product-card-img-wrap">
        <img
          src={currentPreview}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />
      </Link>

      {/* Interactive Mini-Thumbnail Selector Row (Feature from Reference Mockup) */}
      <div className="product-card-thumbs">
        {previewImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Preview ${idx + 1}`}
            className={`product-mini-thumb ${selectedImgIdx === idx ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedImgIdx(idx);
            }}
          />
        ))}
      </div>

      {/* Card Info */}
      <div className="product-card-body">
        <div className="product-category-meta">
          <span className="product-category-badge">
            {product.categories?.name || 'Curated'}
          </span>
          {product.mood && (
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>• {product.mood}</span>
          )}
        </div>

        <Link to={`/products/${product.id}`}>
          <h3 className="product-card-title" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {isLowStock && (
          <p className="stock-warning">⚠️ Only {product.stock} left!</p>
        )}
        {isOutOfStock && (
          <p className="stock-warning" style={{ color: '#ef4444' }}>Out of Stock</p>
        )}

        <div className="product-card-footer">
          <div className="product-price-box">
            <span className="product-price">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <span className="product-original-price">
                ₹{Number(product.original_price).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`btn btn-sm ${isOutOfStock ? 'btn-disabled' : added ? 'btn-success' : 'btn-primary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 0.85rem' }}
            title="Add to cart"
          >
            {added ? (
              <Check size={15} />
            ) : (
              <ShoppingCart size={15} />
            )}
            <span>{isOutOfStock ? 'Sold Out' : added ? 'Added' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
