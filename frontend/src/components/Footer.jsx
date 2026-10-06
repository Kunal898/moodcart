import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div>
            <Link to="/" className="navbar-brand" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
              Mood<span className="navbar-brand-accent">Cart</span>
            </Link>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '300px' }}>
              Shop according to how you feel. Hand-picked products curated for your emotional vibe and productivity.
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
              <p>📍 MoodCart HQ • Mumbai, India</p>
              <p>✉️ support@moodcart.com</p>
            </div>
          </div>

          {/* Col 1: Know Us */}
          <div>
            <h4 className="footer-col-title">Know Us</h4>
            <ul className="footer-links">
              <li><Link to="/about" className="footer-link">About MoodCart</Link></li>
              <li><Link to="/products" className="footer-link">Explore Catalog</Link></li>
              <li><Link to="/find-mood" className="footer-link">Mood Science</Link></li>
              <li><a href="#careers" className="footer-link">Careers</a></li>
              <li><a href="#press" className="footer-link">Press & Media</a></li>
            </ul>
          </div>

          {/* Col 2: Policy */}
          <div>
            <h4 className="footer-col-title">Policy</h4>
            <ul className="footer-links">
              <li><a href="#security" className="footer-link">Security & Trust</a></li>
              <li><a href="#privacy" className="footer-link">Privacy Policy</a></li>
              <li><a href="#terms" className="footer-link">Terms of Service</a></li>
              <li><a href="#returns" className="footer-link">Return & Refund Policy</a></li>
              <li><a href="#compliance" className="footer-link">Compliance</a></li>
            </ul>
          </div>

          {/* Col 3: Help You */}
          <div>
            <h4 className="footer-col-title">Help You</h4>
            <ul className="footer-links">
              <li><Link to="/orders" className="footer-link">My Orders</Link></li>
              <li><Link to="/cart" className="footer-link">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="footer-link">Wishlist</Link></li>
              <li><a href="#shipping" className="footer-link">Shipping & Delivery</a></li>
              <li><a href="#support" className="footer-link">Customer Care</a></li>
            </ul>
          </div>

          {/* Col 4: Moods */}
          <div>
            <h4 className="footer-col-title">Shop by Mood</h4>
            <ul className="footer-links">
              <li><Link to="/products?mood=happy" className="footer-link">😊 Happy & Radiant</Link></li>
              <li><Link to="/products?mood=relaxed" className="footer-link">🌿 Calm & Relaxed</Link></li>
              <li><Link to="/products?mood=party" className="footer-link">🎉 Party & Celebration</Link></li>
              <li><Link to="/products?mood=work" className="footer-link">💼 Deep Work & Focus</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} MoodCart. All rights reserved. Designed for mindful commerce.</p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: '#94a3b8' }}>
              EXPECT MORE. PAY LESS.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
