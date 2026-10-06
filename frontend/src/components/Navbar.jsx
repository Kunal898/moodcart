import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProducts } from '../services/productService';
import { Home, Search, Heart, ShoppingCart, User as UserIcon, Sparkles, LogOut, Package, ShieldCheck } from 'lucide-react';

const SEARCH_PLACEHOLDERS = [
  'Search your item, mood, or vibe...',
  'Try "Matcha" for radiant mornings 😊',
  'Try "Scented Candle" for pure calm 🌿',
  'Try "Bluetooth Speaker" for party vibes 🎉',
  'Try "Mechanical Keyboard" for deep work 💼',
  'Try "Yoga Mat" for mindful workouts 🧘',
];

export default function Navbar({ onOpenMoodFinder }) {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Dynamic typing / cycling placeholder animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  // Scroll listener for compact frosted glass transition
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounced search for live dropdown
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await getProducts({ search: searchQuery.trim() });
        setSearchResults((data || []).slice(0, 5));
        setShowSearchDropdown(true);
      } catch (e) {
        console.error(e);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  async function handleLogout() {
    setShowUserDropdown(false);
    await logout();
    navigate('/login');
  }

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'navbar-scrolled' : ''}`}>
      {/* Animated Glowing Accent Border at top of header */}
      <div className="navbar-top-shimmer" />

      <nav className="navbar">
        {/* Animated Brand Logo & Home Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link to="/" className="navbar-brand animated-brand" title="MoodCart Home">
            <span className="brand-icon-spin">🛒</span>
            <span className="brand-text-mood">Mood</span>
            <span className="navbar-brand-accent brand-shimmer-text">Cart</span>
          </Link>

          <Link to="/" className="navbar-home-btn animated-icon-btn" title="Home" aria-label="Home">
            <Home size={19} />
          </Link>
        </div>

        {/* Pill Shaped Search Bar with Cycling Animated Placeholder */}
        <div className="navbar-search-container" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="navbar-search-bar animated-search-bar">
            <Search size={18} className="search-icon animated-search-icon" />
            <input
              type="text"
              className="navbar-search-input"
              placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
              aria-label="Search items"
            />
          </form>

          {showSearchDropdown && searchResults.length > 0 && (
            <div className="search-dropdown dropdown-animated-open">
              <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Results
              </div>
              {searchResults.map((item) => (
                <Link
                  key={item.id}
                  to={`/products/${item.id}`}
                  className="search-dropdown-item animated-dropdown-item"
                  onClick={() => setShowSearchDropdown(false)}
                >
                  <img
                    src={item.image_url || 'https://placehold.co/80x80?text=Item'}
                    alt={item.name}
                    className="search-item-img"
                  />
                  <div className="search-item-info">
                    <p className="search-item-title">{item.name}</p>
                    <p className="search-item-price">₹{Number(item.price).toLocaleString('en-IN')}</p>
                  </div>
                  {item.mood && (
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: '#f1f5f9', fontWeight: '700', textTransform: 'capitalize' }}>
                      {item.mood}
                    </span>
                  )}
                </Link>
              ))}
              <div style={{ padding: '0.65rem', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}
                >
                  View all results for "{searchQuery}" →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Navigation Controls */}
        <div className="navbar-actions">
          {/* Animated Find Mood Button */}
          <button
            onClick={onOpenMoodFinder}
            className="btn btn-outline btn-sm btn-pill animated-mood-btn"
            title="Interactive Mood Finder"
          >
            <Sparkles size={15} className="sparkle-anim" />
            <span style={{ fontSize: '0.825rem', fontWeight: '700' }}>Find Mood</span>
          </button>

          {/* Wishlist Icon Button */}
          <Link to="/wishlist" className="nav-icon-btn animated-icon-btn" title="My Wishlist" aria-label="Wishlist">
            <Heart size={19} className="nav-heart-icon" />
            {wishlistCount > 0 && <span className="nav-badge animated-badge-pulse">{wishlistCount}</span>}
          </Link>

          {/* Cart Icon Button */}
          <Link to="/cart" className="nav-icon-btn animated-icon-btn" title="Shopping Cart" aria-label="Shopping Cart">
            <ShoppingCart size={19} className="nav-cart-icon" />
            {cartCount > 0 && <span className="nav-badge animated-badge-pulse">{cartCount}</span>}
          </Link>

          {/* User Account Dropdown Menu */}
          <div className="user-menu-wrapper" ref={userMenuRef}>
            <button
              onClick={() => setShowUserDropdown((prev) => !prev)}
              className="nav-icon-btn animated-icon-btn"
              title="User Account"
              aria-label="User Account"
            >
              <UserIcon size={19} />
            </button>

            {showUserDropdown && (
              <div className="user-dropdown dropdown-animated-open">
                {user ? (
                  <>
                    <div className="user-dropdown-header">
                      <p className="user-dropdown-name">{user.user_metadata?.full_name || 'MoodCart Shopper'}</p>
                      <p className="user-dropdown-email">{user.email}</p>
                    </div>

                    <Link
                      to="/orders"
                      className="user-dropdown-link"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <Package size={16} />
                      My Orders
                    </Link>

                    <Link
                      to="/wishlist"
                      className="user-dropdown-link"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <Heart size={16} />
                      Wishlist ({wishlistCount})
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="user-dropdown-link"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <ShieldCheck size={16} color="#ef4444" />
                        Admin Panel
                        <span className="admin-badge-pill">Admin</span>
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.35rem 0' }} />

                    <button
                      onClick={handleLogout}
                      className="user-dropdown-link"
                      style={{ color: '#ef4444' }}
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="user-dropdown-header">
                      <p className="user-dropdown-name">Welcome to MoodCart</p>
                      <p className="user-dropdown-email">Sign in to save your cart & vibe</p>
                    </div>
                    <Link
                      to="/login"
                      className="user-dropdown-link"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="user-dropdown-link"
                      style={{ color: 'var(--primary)', fontWeight: '700' }}
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Animated Bottom Shimmer Line */}
      <div className="navbar-bottom-shimmer" />
    </header>
  );
}
